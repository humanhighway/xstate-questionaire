import { Machine, assign, interpret } from 'xstate';
import { recursive } from 'merge';

export const states = {
  NAME_INPUT: 'NAME_INPUT',
  QUESTION1: 'QUESTION1',
  QUESTION2: 'QUESTION2',
  QUESTION3: 'QUESTION3',
  CONFIRMED: 'CONFIRMED',
};

export const eventTypes = {
  INPUT_NAME_COMPLETED: 'INPUT_NAME_COMPLETED',
  BACK_TO_NAME_INPUT: 'BACK_TO_NAME_INPUT',
  PREV_QUESTION: 'PREV_QUESTION',
  NEXT_QUESTION: 'NEXT_QUESTION',
  UPDATE_CHECKED: 'UPDATE_CHECKED',
  CONFIRM: 'CONFIRM',
};

export const machineConfig = {
  id: 'questionaireMachine',
  initial: states.NAME_INPUT,
  context: {
    username: '',
    questionIndex: 0,
    questions: [
      { description: 'have you ever used redux?', checked: null },
      { description: 'have you ever used react context API?', checked: null },
      { description: 'wanna try xstate?', checked: null },
    ],
  },
  states: {
    [states.NAME_INPUT]: {
      on: {
        [eventTypes.INPUT_NAME_COMPLETED]: {
          target: states.QUESTION1,
          actions: ['updateUsername'],
        }
      }
    },
    [states.QUESTION1]: {
      on: {
        [eventTypes.NEXT_QUESTION]: {
          target: states.QUESTION2,
          actions: ['nextQuestionIndex'],
        },
        [eventTypes.BACK_TO_NAME_INPUT]: states.NAME_INPUT,
      },
    },
    [states.QUESTION2]: {
      on: {
        [eventTypes.PREV_QUESTION]: {
          target: states.QUESTION1,
          actions: ['prevQuestionIndex'],
        },
        [eventTypes.NEXT_QUESTION]: {
          target: states.QUESTION3,
          actions: ['nextQuestionIndex'],
        },

      }
    },
    [states.QUESTION3]: {
      on: {
        [eventTypes.PREV_QUESTION]: {
          target: states.QUESTION2,
          actions: ['prevQuestionIndex'],
        },

        [eventTypes.CONFIRM]: states.CONFIRMED,
      }
    },
    [states.CONFIRMED]: {
      type: 'final',
    },
  },
};

const updateCheckdConfig = {
  states: {
    [states.QUESTION1]: {
      on: {
        [eventTypes.UPDATE_CHECKED]: {
          actions: ['updateChecked'],
        },
      },
    },
    [states.QUESTION2]: {
      on: {
        [eventTypes.UPDATE_CHECKED]: {
          actions: ['updateChecked'],
        },
      }
    },
    [states.QUESTION3]: {
      on: {
        [eventTypes.UPDATE_CHECKED]: {
          actions: ['updateChecked'],
        },
      }
    },
  },
}

const machineOption = {
  actions: {
    updateUsername: assign({
      username: (ctx, event) => event.username,
    }),
    prevQuestionIndex: assign({
      questionIndex: (ctx, event) => ctx.questionIndex - 1,
    }),
    nextQuestionIndex: assign({
      questionIndex: (ctx, event) => ctx.questionIndex + 1,
    }),
    updateChecked: assign({
      questions: (ctx, event) => {
        const newQuestions = [...ctx.questions];
        const checked = event.checked;
        const index = ctx.questionIndex;
        newQuestions[index].checked = checked;
        return ctx.questions;
      }
    }),
  }
};

export const machine = Machine(recursive(machineConfig, updateCheckdConfig), machineOption);
export const service = interpret(machine).start();
