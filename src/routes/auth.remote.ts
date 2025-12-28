import { form } from '$app/server';
import { invalid } from '@sveltejs/kit';
import { loginSchema } from './auth.schema';

export const login = form(loginSchema, async ({ username, _password, id }) => {
	console.log('📝 Login Form Submitted:', { username, _password, id });
	await new Promise((resolve) => setTimeout(resolve, 500));

	if (username === 'admin' && _password === 'password123') {
		return { success: true, message: 'Welcome back!' };
	}
	invalid('Invalid credentials');
});
