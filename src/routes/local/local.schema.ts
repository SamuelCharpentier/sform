import * as v from 'valibot';
import { wireName } from '$lib/local';

export const subscribeSchema = v.object({
	email: v.config(
		v.pipe(
			v.string(),
			wireName('EMAIL'),
			v.nonEmpty('Email is required'),
			v.email('Enter a valid email address')
		),
		{ abortPipeEarly: true }
	),
	first_name: v.pipe(v.string(), wireName('FNAME'), v.nonEmpty('First name is required')),
	last_name: v.optional(v.pipe(v.string(), wireName('LNAME')), ''),
	interests: v.optional(v.pipe(v.array(v.string()), wireName('INTERESTS')), [])
});
