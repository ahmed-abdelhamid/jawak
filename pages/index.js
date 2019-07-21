import React from 'react';
import Router from 'next/router';
import nextCookie from 'next-cookies';
import axios from 'axios';
import { withFormik } from 'formik';
import * as Yup from 'yup';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { useStyles } from '../styles/loginPage';
import { login } from '../helperFunctions/authFunctions';

const validationSchema = Yup.object({
  emailorphone: Yup.string('').required('Required Field'),
  password: Yup.string('').required('Required Field')
});

const Index = ({
  values: { emailorphone, password },
  errors,
  touched,
  handleSubmit,
  handleChange,
  isValid,
  setFieldTouched,
  isSubmitting
}) => {
  const classes = useStyles();

  const change = (name, e) => {
    e.persist();
    handleChange(e);
    setFieldTouched(name, true, false);
  };

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate onSubmit={handleSubmit}>
          <TextField
            id="emailorphone"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            label="Email Address Or Phone Number"
            name="emailorphone"
            autoFocus
            helperText={touched.emailorphone ? errors.emailorphone : ''}
            error={touched.emailorphone && !!errors.emailorphone}
            value={emailorphone}
            onChange={change.bind(null, 'emailorphone')}
          />
          <TextField
            id="password"
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            helperText={touched.password ? errors.password : ''}
            error={touched.password && !!errors.password}
            value={password}
            onChange={change.bind(null, 'password')}
          />
          {errors.credentials && (
            <Typography color="secondary" align="center">
              {errors.credentials}
            </Typography>
          )}
          <div className={classes.loadingWrapper}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              disabled={!isValid || isSubmitting}
            >
              Sign In
            </Button>
            {isSubmitting && (
              <CircularProgress size={24} className={classes.loading} />
            )}
          </div>
        </form>
      </div>
    </Container>
  );
};

Index.getInitialProps = async ctx => {
  const { token } = nextCookie(ctx);

  const redirectOnError = () =>
    typeof window !== 'undefined'
      ? Router.push('/events')
      : ctx.res.writeHead(302, { location: '/events' }).end();

  if (token) {
    return redirectOnError();
  }

  return;
};

export default withFormik({
  displayName: 'LoginForm',
  mapPropsToValues: () => ({ emailorphone: '', password: '' }),
  validationSchema,
  handleSubmit: async (
    { emailorphone, password },
    { setSubmitting, setFieldError }
  ) => {
    try {
      const { data: token } = await axios.post(
        `${process.env.API_URL}/api/admin/login`,
        {
          emailorphone,
          password
        }
      );
      login({ token });
    } catch (e) {
      if (e.message === 'Network Error') {
        setFieldError(
          'credentials',
          `Network error, please check your internet connection.`
        );
      } else {
        setFieldError('credentials', 'Wrong Credentials.');
      }
      setSubmitting(false);
    }
  }
})(Index);
