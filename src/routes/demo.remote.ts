import * as v from 'valibot';
import { form } from '$app/server';
import { customAmountSchema } from './customAmount.schema';

/**
 * User Settings Demo Form
 * Demonstrates: range, toggle, toggle-options, select
 */
const settingsSchema = v.object({
	volume: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
	notifications: v.fallback(v.boolean(), false),
	theme: v.pipe(v.string(), v.nonEmpty('Please select a theme')),
	priority: v.pipe(v.string(), v.nonEmpty('Please select a priority level'))
});

export const settings = form(settingsSchema, async (data) => {
	console.log('📝 Settings Form Submitted:', data);
	await new Promise((resolve) => setTimeout(resolve, 300));
	return { success: true, message: 'Settings saved!' };
});

/**
 * Contact Info Demo Form
 * Demonstrates: masked inputs (phone, credit card)
 */
const contactSchema = v.object({
	phone: v.pipe(
		v.string(),
		v.nonEmpty('Phone number is required'),
		v.minLength(10, 'Phone number must be complete')
	),
	creditCard: v.pipe(
		v.string(),
		v.nonEmpty('Credit card is required'),
		v.minLength(16, 'Credit card must be complete')
	),
	ssn: v.pipe(v.string(), v.nonEmpty('SSN is required'), v.minLength(9, 'SSN must be complete'))
});

export const contactInfo = form(contactSchema, async (data) => {
	console.log('📝 Contact Info Form Submitted:', data);
	await new Promise((resolve) => setTimeout(resolve, 300));
	return { success: true, message: 'Contact info saved!' };
});

/**
 * Survey Demo Form
 * Demonstrates: textarea, checkbox, checkbox-group, radio, number
 */
const surveySchema = v.object({
	feedback: v.pipe(
		v.string(),
		v.nonEmpty('Please provide feedback'),
		v.minLength(10, 'Feedback must be at least 10 characters')
	),
	rating: v.pipe(
		v.number(),
		v.minValue(1, 'Rating must be at least 1'),
		v.maxValue(10, 'Rating cannot exceed 10')
	),
	interests: v.pipe(v.array(v.string()), v.minLength(1, 'Please select at least one interest')),
	subscribe: v.fallback(v.boolean(), false),
	contactMethod: v.pipe(v.string(), v.nonEmpty('Please select a contact method'))
});

export const survey = form(surveySchema, async (data) => {
	console.log('📝 Survey Form Submitted:', data);
	await new Promise((resolve) => setTimeout(resolve, 300));
	return { success: true, message: 'Thank you for your feedback!' };
});

export const customAmount = form(customAmountSchema, async (data) => {
	console.log('📝 Custom Amount Form Submitted:', data);
	await new Promise((resolve) => setTimeout(resolve, 300));
	return { success: true, message: 'Amount submitted!' };
});
