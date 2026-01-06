import { form } from '$app/server';
import { subscribeFormSchema } from './auth.schema';

export const subscribeForm = form(subscribeFormSchema, async (data) => {
	console.log('📝 Login Form Submitted:', data);
	await new Promise((resolve) => setTimeout(resolve, 500));
	return { success: true, message: 'Subscribed!' };
});
