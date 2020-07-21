import React, { useEffect, useState } from 'react';
import { Box, Button, Text, Heading, Radio, RadioGroup, Input } from '@chakra-ui/core';
import { useService } from '@xstate/react';
import { service, eventTypes, states } from './../fsm/questionaireMachine';

function InputNamePage() {
  const [current, send] = useService(service);
  const [username, setUsername] = useState(current.context.username);
  const onInputChange = (e) => {
    setUsername(e.target.value);
  }
  const onNextClick = e => {
    send({ type: eventTypes.INPUT_NAME_COMPLETED, username });
  }
  return (
    <Box data-testid="input-name-page" w="100%" h="100%" position="relative">
      <Text fontWeight="bold">Name:</Text>
      <Input data-testid="username-input" onChange={onInputChange} value={username}></Input>
      <Button data-testid="next-to-qpage-button"
        display="block"
        position="absolute" bottom="0" right="0"
        onClick={onNextClick}
        disabled={username.length < 1} >
        next
        </Button>
    </Box>
  )
}

function QuestionsPage() {
  const [current, send] = useService(service);
  const context = current.context;
  const { questionIndex, questions } = context;
  const question = context.questions[context.questionIndex];
  const allChecked = questions.every(({ checked }) => checked !== null);
  const isLastIndex = questionIndex === questions.length - 1;
  let checkedValue = '';
  const checked = question.checked;
  if (checked !== null) checkedValue = checked ? 'yes' : 'no';

  const onYesClick = () => send({ type: eventTypes.UPDATE_CHECKED, checked: true });
  const onNoClick = () => send({ type: eventTypes.UPDATE_CHECKED, checked: false });
  const onPrevClick = () => {
    const type = questionIndex === 0 ? eventTypes.BACK_TO_NAME_INPUT : eventTypes.PREV_QUESTION
    send({ type })
  };
  const onNextClick = () => send({ type: eventTypes.NEXT_QUESTION });
  const onConfirmClick = () => send({ type: eventTypes.CONFIRM });

  return (
    <Box data-testid="questions-page" w="100%" h="100%" position="relative"
      display={current.matches(states.CONFIRMED) ? 'none' : 'block'} >
      <Text w="100%" fontWeight="bold" lineHeight="40px"> {question.description}</Text>
      <RadioGroup value={checkedValue} isInline spacing={8}>
        <Radio data-testid="yes-radio" value="yes" onClick={onYesClick}>YES</Radio>
        <Radio data-testid="no-radio" value="no" onClick={onNoClick}>NO</Radio>
      </RadioGroup>
      <Button data-testid="prev-button"
        position="absolute" bottom="0" left="0"
        onClick={onPrevClick} >prev</Button>
      <Button data-testid="next-button"
        display="block"
        position="absolute" bottom="0" right="0"
        onClick={onNextClick}
        disabled={checkedValue === ''}
        display={isLastIndex ? 'none' : 'block'}>
        next
        </Button>
      <Button data-testid="confirm-button" display="confirm"
        position="absolute" bottom="0" right="0"
        onClick={onConfirmClick}
        disabled={allChecked ? '' : true}
        display={isLastIndex ? 'block' : 'none'}>
        confirm
        </Button>
    </Box >
  )
}

function ResultPage() {
  const [current, send] = useService(service);
  return (
    <Box data-testid="result" w="100%" h="100%">
      <Text fontWeight="bold" marginBottom="16px">Name: {current.context.username}</Text>
      {
        current.context.questions.map(({ description, checked }, index) => (
          <Box key={`q${index}`}>
            <Text fontWeight="bold">{description}</Text>
            <Text fontStyle="italic"> {checked ? 'YES' : 'NO'}</Text>
          </Box>
        ))
      }
    </Box>
  )
}

export default function Questionaire() {
  const [current, send] = useService(service);
  return (
    <>
      <Heading as="h2" size="l" m="16px" >state: {current.value}</Heading>
      <Box m="16px" p="16px" w="400px" h="230px" border="1px solid black">
        {current.matches(states.NAME_INPUT) && <InputNamePage />}
        {![states.CONFIRMED, states.NAME_INPUT].some(current.matches) && <QuestionsPage />}
        {current.matches(states.CONFIRMED) && <ResultPage />}
      </Box>
    </>
  )
}