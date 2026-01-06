import * as v from 'valibot';

export const subscribeFormSchema = v.objectAsync({
	first_name: v.pipe(
		v.string(),
		v.title('First Name'),
		v.description('Please enter your first name'),
		v.nonEmpty('First name is required')
	),
	last_name: v.pipe(
		v.string(),
		v.title('Last Name'),
		v.description('Please enter your last name'),
		v.nonEmpty('Last name is required')
	),
	email: v.config(
		v.pipe(
			v.string(),
			v.title('Email'),
			v.description('Please enter a valid email address'),
			v.nonEmpty('Email is required'),
			v.email('Invalid email address')
		),
		{ abortPipeEarly: true }
	),
	groups: v.optionalAsync(
		v.pipe(
			v.array(v.pipe(v.string(), v.nonEmpty())),
			v.nonEmpty('Something went wrong, please try again. (g-1)')
		),
		['default']
	),
	recaptchaToken: v.pipe(
		v.string('Security check failed, please try again. (r-1)'),
		v.nonEmpty('Security check failed, please try again. (r-2)')
	)
});
