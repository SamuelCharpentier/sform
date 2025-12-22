import * as v from 'valibot';

export const loginSchema = v.object({
	id: v.optional(v.string()),
	username: v.pipe(
		v.string(),
		v.nonEmpty('Username is required'),
		v.minLength(3, 'Username must be at least 3 characters')
	),
	_password: v.pipe(
		v.string(),
		v.nonEmpty('Password is required'),
		v.minLength(8, 'Password must be at least 8 characters')
	)
});
