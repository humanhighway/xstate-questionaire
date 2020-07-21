import { createModel } from '@xstate/test';
import { Machine, interpret, assign } from 'xstate';
import { machine as questionaireMachine, eventTypes as questionaireMachineEventTypes } from './questionaireMachine';

export const states = {
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

export const eventTypes = {
  INPUT_USERNAME: 'INPUT_USERNAME',
  NEXT_TO_Q2_FIRST_TIME: 'NEXT_TO_Q2_FIRST_TIME',
  NEXT_TO_Q3_FIRST_TIME: 'NEXT_TO_Q3_FIRST_TIME',
  PREV_TO_Q2: 'PREV_TO_Q2',
  PREV_TO_Q1: 'PREV_TO_Q1',
  NEXT_TO_Q2: 'NEXT_TO_Q2',
  NEXT_TO_Q3: 'NEXT_TO_Q3',
  CONFIRM: 'CONFIRM',
};

const machineConfig = {
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
        test: ({ }) => { }
      },
    },
    [states.Q1]: {
      on: {
        [eventTypes.NEXT_TO_Q2_FIRST_TIME]: {
          target: states.Q2_NEXT_FIRST_TIME,
        }
      },
      meta: {
        test: ({ state }) => {
          expect(state.context.username.length !== 0).toBeTruthy();
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
        test: ({ state }) => {
          expect(state.context.questions[0].checked).toBeFalsy();
          expect(state.context.questionIndex === 1).toBeTruthy();
        }
      },
    },
    [states.Q3_NEXT_FIRST_TIME]: {
      on: {
        [eventTypes.PREV_TO_Q2]: {
          target: states.Q2_PREV,
        },
      },
      meta: {
        test: ({ state }) => {
          expect(state.context.questions[1].checked).toBeFalsy();
          expect(state.context.questionIndex === 2).toBeTruthy();
        },
      },
    },
    [states.Q2_PREV]: {
      on: {
        [eventTypes.PREV_TO_Q1]: {
          target: states.Q1_PREV,
        }
      },
      meta: {
        test: ({ state }) => {
          expect(state.context.questionIndex === 1).toBeTruthy();
        },
      },
    },
    [states.Q1_PREV]: {
      on: {
        [eventTypes.NEXT_TO_Q2]: {
          target: states.Q2_NEXT,
        },
      },
      meta: {
        test: ({ state }) => {
          expect(state.context.questionIndex === 0).toBeTruthy();
        },
      },
    },
    [states.Q2_NEXT]: {
      on: {
        [eventTypes.NEXT_TO_Q3]: {
          target: states.Q3_NEXT,
        },
      },
      meta: {
        test: ({ state }) => {
          expect(state.context.questions[0].checked).toBeTruthy();
          expect(state.context.questionIndex === 1).toBeTruthy();
        },
      },
    },
    [states.Q3_NEXT]: {
      on: {
        [eventTypes.CONFIRM]: {
          target: states.CONFIRMED,
        },
      },
      meta: {
        test: ({ state }) => {
          expect(state.context.questions[1].checked).toBeTruthy();
          expect(state.context.questionIndex === 2).toBeTruthy();
        },
      },
    },
    [states.CONFIRMED]: {
      type: 'final',
      meta: {
        test: ({ state }) => {
          expect(state.context.questions.every(({ checked }) => checked)).toBeTruthy();
        },
      },
    },
  }
};

describe('rollback to choose all YES test', () => {
  const testQuestionaireMachine = Machine(machineConfig);
  const testModel = createModel(testQuestionaireMachine).withEvents({
    [eventTypes.INPUT_USERNAME]: {
      exec: ({ send }, { username }) => {
        send(questionaireMachineEventTypes.INPUT_NAME_COMPLETED, { username });
      },
      cases: [{ username: 'Luc' }],
    },
    [eventTypes.NEXT_TO_Q2_FIRST_TIME]: {
      exec: ({ send }, { checked }) => {
        send(questionaireMachineEventTypes.UPDATE_CHECKED, { checked });
        send(questionaireMachineEventTypes.NEXT_QUESTION);
      },
      cases: [{ checked: false }],
    },
    [eventTypes.NEXT_TO_Q3_FIRST_TIME]: {
      exec: ({ send }, { checked }) => {
        send(questionaireMachineEventTypes.UPDATE_CHECKED, { checked });
        send(questionaireMachineEventTypes.NEXT_QUESTION);
      },
      cases: [{ checked: false }],
    },
    [eventTypes.PREV_TO_Q2]: {
      exec: ({ send }) => {
        send(questionaireMachineEventTypes.PREV_QUESTION);
      },
    },
    [eventTypes.PREV_TO_Q1]: {
      exec: ({ send }) => {
        send(questionaireMachineEventTypes.PREV_QUESTION);
      },
    },
    [eventTypes.NEXT_TO_Q2]: {
      exec: ({ send }, { checked }) => {
        send(questionaireMachineEventTypes.UPDATE_CHECKED, { checked });
        send(questionaireMachineEventTypes.NEXT_QUESTION);
      },
      cases: [{ checked: true }],
    },
    [eventTypes.NEXT_TO_Q3]: {
      exec: ({ send }, { checked }) => {
        send(questionaireMachineEventTypes.UPDATE_CHECKED, { checked });
        send(questionaireMachineEventTypes.NEXT_QUESTION);
      },
      cases: [{ checked: true }],
    },
    [eventTypes.CONFIRM]: {
      exec: ({ send }, { checked }) => {
        send(questionaireMachineEventTypes.UPDATE_CHECKED, { checked });
        send(questionaireMachineEventTypes.CONFIRM);
      },
      cases: [{ checked: true }],
    },
  });
  const testPlans = testModel.getSimplePathPlans();
  testPlans.forEach(plan => {
    plan.paths.forEach(path => {
      it(path.description, async () => {
        const service = interpret(questionaireMachine);
        service.start();
        await path.test(service);
      });
    });
  })

  // it("coverage", () => {
  //   testModel.testCoverage();
  // });

});
