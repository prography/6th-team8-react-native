import * as React from 'react';
import styled from 'styled-components/native';
import { useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';

import LinePurpleWhenFocused from '~/components/universal/line/LinePurpleWhenFocused';
import { validateEmail, validatePassword } from '~/utils/validator';
import MarginNarrow from '~/components/universal/margin/MarginNarrow';
import { d, c, l } from '~/utils/constant';

import BottomBtnCollectData from '~/components/universal/bottomBar/BottomBtnCollectData';
import MarginWide from '~/components/universal/margin/MarginWide';
import TopBarBackArrowRightIcon from '~/components/universal/topBar/TopBarBackArrowRightIcon';

import { fetchAPI } from '~/api';
import { llog } from '~/utils/functions';
import { MsgRes } from '~/api/interface';
import { eventUtil } from '~/utils/firebase/event';

const Container = styled.View`
  margin: 0 ${l.mR}px;
`;
const InputContainer = styled.View``;
const GuideTextWrapper = styled.View`
  flex-direction: row;
  align-items: center;
  height: ${d.px * 20}px;
  margin-bottom: ${d.px * 10}px;
`;
const JoinGuideText = styled.Text`
  font-family: Jost-Light;
  font-size: ${d.px * 15}px;
  color: ${(props) => (props.focused ? c.purple : c.lightGray)};
  margin-right: ${d.px * 5}px;
  line-height: ${d.px * 20}px;
`;
const WarningText = styled.Text`
  color: ${c.purple};
  font-family: Jost-Bold;
  font-size: ${d.px * 13}px;
  line-height: ${d.px * 20}px;
`;
const JoinInfoInput = styled.TextInput`
  font-family: Jost-Bold;
  font-size: ${d.px * 23}px;
  font-family: 'Jost-Bold';
  color: ${c.darkGray};
  justify-content: center;
  align-items: center;
`;

const Join1 = () => {
  const [isFilled, setIsFilled] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [emailWarnigText, setEmailWarningText] = useState<string>(null);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [checkPasswordInput, setCheckPasswordInput] = useState<string>('');
  const [emailFocus, handleEmailFocus] = useState<boolean>(false);
  const [passwordFocus, handlePasswordFocus] = useState<boolean>(false);
  const [checkPasswordFocus, handleCheckPasswordFocus] = useState<boolean>(false);
  const [checkPasswordWarning, setCheckPasswordWarning] = useState<boolean>(false);
  useEffect(() => {
    setIsFilled(
      emailInput === '' || passwordInput === '' || checkPasswordInput === '' || !validatePassword(passwordInput)
        ? false
        : emailWarnigText !== null
          ? false
          : !checkPasswordWarning
    );
  }, [
    emailInput,
    passwordInput,
    checkPasswordInput,
    emailWarnigText,
    checkPasswordWarning,
  ]);

  useEffect(() => {
    _checkEmailDuplicate();
  }, [emailInput]);

  const _checkEmailDuplicate = async () => {
    try {
      const { status, response } = await fetchAPI(
        `accounts/check-duplicates/email/?value=${emailInput}`
      );
      const json: MsgRes = await response.json();
      llog('🤯🤯🤯', json);
      if (status === 200) {
        // 중복 안됨! 성공!
        _setEmailWarningText(false);
        llog('🧢🧢이메일 중복 체크', json.message, '중복아님');
      } else {
        _setEmailWarningText(true);
        llog('🧢🧢이메일 중복 체크', json.message, '중복임');
      }
    } catch (error) {
      llog('🧢이메일 중복 체크 실패', error);
    }
  };
  const _setEmailWarningText = (isDuplicate: boolean) => {
    emailInput === ''
      ? setEmailWarningText(null)
      : validateEmail(emailInput)
        ? isDuplicate
          ? setEmailWarningText('* 이미 가입된 메일입니다')
          : setEmailWarningText(null)
        : setEmailWarningText('* 올바른 메일을 입력해주세요');
  };

  const checkPassword = () => {
    passwordInput === ''
      ? setCheckPasswordWarning(false)
      : checkPasswordInput === ''
        ? setCheckPasswordWarning(false)
        : passwordInput === checkPasswordInput
          ? setCheckPasswordWarning(false)
          : setCheckPasswordWarning(true);
  };

  useEffect(() => {
    checkPassword();
  }, [passwordInput, checkPasswordInput]);
  const JoinInputArray = [
    {
      guideText: '이메일',
      placeholder: '이메일 입력',
      onChangeTextFunction: setEmailInput,
      handleFocusFunction: handleEmailFocus,
      inputContent: emailInput,
      focused: emailFocus,
      isPassword: false,
      warningText: emailWarnigText,
      warning: emailWarnigText === null ? false : true,
    },
    {
      guideText: '비밀번호',
      placeholder: '6자리 이상',
      onChangeTextFunction: setPasswordInput,
      handleFocusFunction: handlePasswordFocus,
      inputContent: passwordInput,
      focused: passwordFocus,
      isPassword: true,
      warningText: '* 6~20자, 영문과 숫자를 조합해주세요',
      warning: passwordInput === '' ? false : !validatePassword(passwordInput),
    },
    {
      guideText: '비밀번호 확인',
      placeholder: '위와 같게 입력해주세요',
      onChangeTextFunction: setCheckPasswordInput,
      handleFocusFunction: handleCheckPasswordFocus,
      inputContent: checkPasswordInput,
      focused: checkPasswordFocus,
      isPassword: true,
      warningText: '* 비밀번호가 일치하지 않습니다.',
      warning: checkPasswordWarning,
    },
  ];

  useEffect(() => {
    eventUtil.logScreenView(eventUtil.Join1_Email_Password);
  }, []);

  return (
    <>
      <BottomBtnCollectData
        btnText={'다음'}
        stack={'JoinStack'}
        screen={'Join2'}
        isFilled={isFilled}
        // onPressFunction={_signup}
        params={{
          signUpEmail: emailInput,
          signUpPassword: passwordInput,
          socialJoin: false,
        }}
      >
        <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
          <Container>
            <TopBarBackArrowRightIcon />

            {JoinInputArray.map((data) => {
              return (
                <>
                  <InputContainer>
                    <GuideTextWrapper>
                      <JoinGuideText focused={data.focused}>
                        {data.guideText}
                      </JoinGuideText>
                      {data.warning ? (
                        <WarningText>{data.warningText}</WarningText>
                      ) : null}
                    </GuideTextWrapper>
                    <MarginNarrow />
                    <JoinInfoInput
                      placeholder={data.placeholder}
                      placeholderTextColor={c.extraLightGray}
                      autoCapitalize={'none'}
                      autoCorrect={false}
                      secureTextEntry={data.isPassword}
                      onChangeText={(text) => {
                        data.onChangeTextFunction(text);
                      }}
                      onFocus={() => {
                        data.handleFocusFunction(true);
                      }}
                      onBlur={() => {
                        data.handleFocusFunction(false);
                      }}
                    >
                      {data.inputContent}
                    </JoinInfoInput>
                    <LinePurpleWhenFocused focused={data.focused} />
                  </InputContainer>
                  <MarginWide />
                  <MarginWide />
                </>
              );
            })}
          </Container>
        </KeyboardAwareScrollView>
      </BottomBtnCollectData>
    </>
  );
};

export default Join1;
