import * as v from 'valibot';
import { form } from '$app/server';

const loginSchema = v.object({
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

export const login = form(loginSchema, async ({ username, _password }) => {
	console.log('📝 Login Form Submitted:', { username, _password });
	await new Promise((resolve) => setTimeout(resolve, 500));

	if (username === 'admin' && _password === 'password123') {
		return { success: true, message: 'Welcome back!' };
	}

	return { success: false, message: 'Invalid credentials' };
});
