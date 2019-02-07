/// <reference path="../src/types/swing.d.ts" />

/**
 * @project react-swing
 * Created by ssanjun on 2018. 7. 08..
 */

import * as React from 'react';
import * as swing from 'swing';

interface IReactSwingProps {
  children: React.ReactChildren;

  setStack: (stack: swing.Stack) => void;
  config: any;
}

interface IReactSwingState {
  stack: swing.Stack;
  cardList: swing.Card[];
}

class ReactSwing extends React.Component<IReactSwingProps, IReactSwingState> {
  static EVENTS: swing.Event[] = [
    'throwout',
    'throwoutend',
    'throwoutleft',
    'throwoutright',
    'throwin',
    'throwinend',
    'dragstart',
    'dragmove',
    'dragend',
  ];

  static DIRECTION: swing.Direction = swing.Direction as any;

  private childElements: React.RefObject<any>[] = [];
  constructor(props: IReactSwingProps) {
    super(props);

    const stack = swing.Stack(props.config || {});

    React.Children.forEach(props.children, (_, index) => {
      this.childElements[index] = React.createRef();
    });

    this.state = {
      stack,
      cardList: [],
    };
  }

  componentDidMount() {
    const { children } = this.props;
    const { stack } = this.state;

    ReactSwing.EVENTS.forEach(eventName => {
      if (this.props[eventName]) {
        stack.on(eventName, this.props[eventName]);
      }
    });

    React.Children.forEach(children, (child, index) => {
      const element = this.childElements[index];

      if (element && element.current) {
        const card = stack.createCard(element.current);

        ReactSwing.EVENTS.forEach(eventName => {
          if ((child as React.ReactElement<any>).props[eventName]) {
            card.on(eventName, (child as React.ReactElement<any>).props[eventName]);
          }
        });
      }
    });

    this.setState({
      stack,
    });

    if (this.props.setStack) {
      this.props.setStack(stack);
    }
  }

  componentDidUpdate(prevProps) {
    const { children } = this.props;

    // Re-use stack instance instead of re-creating it 
    const stack = this.state.stack;

    React.Children.forEach(children, (child, index) => {

      // Get HTML element corresponding to Card
      const element = this.childElements[index];
      if (!element || !element.current) return;

      // Avoid re-creating Card
      const existingCard = stack.getCard(element.current);
      if (existingCard) return;

      // Create new card for element
      const card = stack.createCard(element.current);
      ReactSwing.EVENTS.forEach(eventName => {
        if ((child as React.ReactElement<any>).props[eventName]) {
          card.on(eventName, (child as React.ReactElement<any>).props[eventName]);
        }
      });
    });
  }

  render() {
    // tslint:disable-next-line
    const { children, setStack, config, ...restProps } = this.props;

    const tagProps = Object.keys(restProps).reduce((result, key) => {
      if (ReactSwing.EVENTS.indexOf(key as swing.Event) === -1) {
        result[key] = restProps[key];
      }
      return result;
    }, {});

    return (
      <div {...tagProps}>
        {React.Children.map(children, (child, index) => {
          const childProps = Object.keys((child as React.ReactElement<any>).props).reduce((result, key) => {
            if (ReactSwing.EVENTS.indexOf(key as swing.Event) === -1) {
              result[key] = (child as React.ReactElement<any>).props[key];
            }
            return result;
          }, {});
          (childProps as any).ref = this.childElements[index];
          return React.createElement((child as React.ReactElement<any>).type, childProps);
        })}
      </div>
    );
  }
}

export default ReactSwing;
