import React from 'react';
import * as yup from 'yup'
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import LoginWrapper from '../Signup/Signup.style';
import Flex from 'components/common/Flex';
import Logo from 'assets/svg/BugVilla.svg'
import Input from 'components/common/Form/Input';
import IconLink from 'components/common/IconLink';
import Button from 'components/common/Button';

import { loginUser } from 'store/ducks/auth';
import { useDispatch } from 'react-redux';

const LoginSchema = yup.object().shape({
  email: yup.string().min(5).max(100).email().required(),
  password: yup.string().min(6).max(100).required(),
})


const Login: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { register, handleSubmit, errors }: any = useForm({
    validationSchema: LoginSchema
  });


  const onSubmit = async (data: { name: string, email: string }) => {
    console.log(data)
    // submit form

    dispatch(loginUser(data, history))
  }

  return (
    <LoginWrapper>
      <Flex align="center" justify="center" direction="column">
        <img className="logo" src={Logo} alt="BugVilla Logo" />
        <h2 className="text--bold">Welcome back!</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            name="email"
            type="email"
            icon="envelope"
            placeholder="example@gmail.com"
            errors={errors}
            inputRef={register({ required: 'Email is required' })}
          />

          <Input
            type="password"
            name="password"
            icon="lock"
            placeholder="password"
            errors={errors}
            inputRef={register({ required: 'Password is Required' })}
          />

          <Button type="submit" width="50%" icon="arrow-right">SignUp</Button>
        </form>

        <IconLink className="color--gray" to="/">
          Don't have an account?
        </IconLink>
      </Flex>
    </LoginWrapper>
  )
}

export default Login;