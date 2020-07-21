/// <reference types="cypress" />
import { createModel } from '@xstate/test';
import { Machine } from 'xstate';

const states = {
  USERNAME_INPUT: 'USERNAME_INPUT',
  Q1: 'Q1',
  Q2_NEXT_FIRST_TIME: 'Q2_NEXT_FIRST_TIME',
  Q3_NEXT_FIRST_TIME: 'Q3_NEXT_FIRST_TIME',
  Q2_PREV: 'Q2_PREV',
  Q1_PREV: 'Q1_PREV',
  Q2_NEXT: 'Q2_NEXT',
  Q3_NEXT: 'Q3_NEXT',
  CONFIRMED: 'CONFIRMED',
};

const eventTypes = {
  INPUT_USERNAME: 'INPUT_USERNAME',
  NEXT_TO_Q2_FIRST_TIME: 'NEXT_TO_Q2_FIRST_TIME',
  NEXT_TO_Q3_FIRST_TIME: 'NEXT_TO_Q3_FIRST_TIME',
  PREV_TO_Q2: 'PREV_TO_Q2',
  PREV_TO_Q1: 'PREV_TO_Q1',
  NEXT_TO_Q2: 'NEXT_TO_Q2',
  NEXT_TO_Q3: 'NEXT_TO_Q3',
  CONFIRM: 'CONFIRM',
};

const testConfig = {
  id: 'testQuestionaireMachine',
  initial: states.USERNAME_INPUT,
  states: {
    [states.USERNAME_INPUT]: {
      on: {
        [eventTypes.INPUT_USERNAME]: {
          target: states.Q1,
        },
      },
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('questions-page').should('not.exist');
          findByTestId('result').should('not.exist');
          findByTestId('next-to-qpage-button').should('be.disabled');
        }
      },
    },
    [states.Q1]: {
      on: {
        [eventTypes.NEXT_TO_Q2_FIRST_TIME]: {
          target: states.Q2_NEXT_FIRST_TIME,
        }
      },
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('next-button').should('be.disabled');
          findByTestId('confirm-button').should('have.css', 'display', 'none');
        }
      },
    },
    [states.Q2_NEXT_FIRST_TIME]: {
      on: {
        [eventTypes.NEXT_TO_Q3_FIRST_TIME]: {
          target: states.Q3_NEXT_FIRST_TIME,
        }
      },
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('next-button').should('be.disabled');
          findByTestId('confirm-button').should('have.css', 'display', 'none');
        }
      },
    },
    [states.Q3_NEXT_FIRST_TIME]: {
      on: {
        [eventTypes.PREV_TO_Q2]: {
          target: states.Q2_PREV,
        }
      },
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('confirm-button').should('be.disabled');
          findByTestId('next-button').should('have.css', 'display', 'none');
        }
      },
    },
    [states.Q2_PREV]: {
      on: {
        [eventTypes.PREV_TO_Q1]: {
          target: states.Q1_PREV,
        }
      },
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('next-button').should('be.not.disabled');
          findByTestId('confirm-button').should('have.css', 'display', 'none');
        }
      },
    },
    [states.Q1_PREV]: {
      on: {
        [eventTypes.NEXT_TO_Q2]: {
          target: states.Q2_NEXT,
        },
      },
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('next-button').should('be.not.disabled');
          findByTestId('confirm-button').should('have.css', 'display', 'none');
        }
      },
    },
    [states.Q2_NEXT]: {
      on: {
        [eventTypes.NEXT_TO_Q3]: {
          target: states.Q3_NEXT,
        },
      },
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('next-button').should('be.not.disabled');
          findByTestId('confirm-button').should('have.css', 'display', 'none');
        }
      },
    },
    [states.Q3_NEXT]: {
      on: {
        [eventTypes.CONFIRM]: {
          target: states.CONFIRMED,
        },
      },
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('confrim-button').should('be.not.disabled');
          findByTestId('next-button').should('have.css', 'display', 'none');
        }
      },
    },
    [states.CONFIRMED]: {
      type: 'final',
      meta: {
        test: ({ findByTestId }) => {
          findByTestId('questions-page').should('not.exist');
          findByTestId('result').should('exist');
        }
      },
    },
  }
};

describe('rollback to choose all YES test', () => {
  const machine = Machine(testConfig)
  const testModel = createModel(machine).withEvents({
    [eventTypes.INPUT_USERNAME]: {
      exec: ({ findByTestId }, { username }) => {
        findByTestId('username-input').type(username);
        findByTestId('next-to-qpage-button').click();
      },
      cases: [{ username: 'Luc' }],
    },
    [eventTypes.NEXT_TO_Q2_FIRST_TIME]: {
      exec: ({ findByTestId }) => {
        findByTestId('no-radio').click();
        findByTestId('next-button').click();
      },
    },
    [eventTypes.NEXT_TO_Q3_FIRST_TIME]: {
      exec: ({ findByTestId }) => {
        findByTestId('no-radio').click();
        findByTestId('next-button').click();
      },
    },
    [eventTypes.PREV_TO_Q2]: {
      exec: ({ findByTestId }) => {
        findByTestId('prev-button').click();
      },
    },
    [eventTypes.PREV_TO_Q1]: {
      exec: ({ findByTestId }) => {
        findByTestId('prev-button').click();
      },
    },
    [eventTypes.NEXT_TO_Q2]: {
      exec: ({ findByTestId }) => {
        findByTestId('yes-radio').click();
        findByTestId('next-button').click();
      },
    },
    [eventTypes.NEXT_TO_Q3]: {
      exec: ({ findByTestId }) => {
        findByTestId('yes-radio').click();
        findByTestId('next-button').click();
      },
    },
    [eventTypes.CONFIRM]: {
      exec: ({ findByTestId }) => {
        findByTestId('yes-radio').click();
        findByTestId('confirm-button').click();
      },
    },
  });

  const testPlans = testModel.getSimplePathPlans();
  testPlans.forEach(plan => {
    plan.paths.forEach(path => {
      it(path.description, () => {
        return cy.visit('http://localhost:8080/').then(() => {
          return path.test(cy);
        });
      });
    });
  })

  it('coverage', () => {
    testModel.testCoverage();
  });

});
