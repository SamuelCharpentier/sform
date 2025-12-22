import { page } from 'vitest/browser';
import { describe, expect, it, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	beforeEach(() => {
		render(Page);
	});

	describe('page structure', () => {
		it('should render main heading', async () => {
			const heading = page.getByRole('heading', { level: 1, name: 'Sform Library Demo' });
			await expect.element(heading).toBeInTheDocument();
		});

		it('should render all form sections', async () => {
			await expect
				.element(page.getByRole('heading', { level: 2, name: /Login Form/i }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('heading', { level: 2, name: /Settings Form/i }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('heading', { level: 2, name: /Contact Info Form/i }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('heading', { level: 2, name: /Survey Form/i }))
				.toBeInTheDocument();
			await expect
				.element(page.getByRole('heading', { level: 2, name: /Features/i }))
				.toBeInTheDocument();
		});
	});

	describe('Login Form', () => {
		it('should have username text input', async () => {
			const input = page.getByPlaceholder('Enter username');
			await expect.element(input).toBeInTheDocument();
		});

		it('should have password input with toggle button', async () => {
			const input = page.getByPlaceholder('Enter password');
			await expect.element(input).toBeInTheDocument();
			await expect.element(input).toHaveAttribute('type', 'password');

			// Find the password toggle button
			const toggleButton = page.getByRole('button', { name: /show password/i });
			await expect.element(toggleButton).toBeInTheDocument();
		});

		it('should toggle password visibility when clicking eye icon', async () => {
			const input = page.getByPlaceholder('Enter password');
			await expect.element(input).toHaveAttribute('type', 'password');

			// Click the toggle button
			const toggleButton = page.getByRole('button', { name: /show password/i });
			await toggleButton.click();

			// Password should now be visible
			await expect.element(input).toHaveAttribute('type', 'text');

			// Click again to hide
			const hideButton = page.getByRole('button', { name: /hide password/i });
			await hideButton.click();

			// Password should be hidden again
			await expect.element(input).toHaveAttribute('type', 'password');
		});

		it('should have Login submit button', async () => {
			const button = page.getByRole('button', { name: 'Login' });
			await expect.element(button).toBeInTheDocument();
		});
	});

	describe('Settings Form', () => {
		it('should have volume range slider', async () => {
			const input = page.getByLabelText('Volume');
			await expect.element(input).toBeInTheDocument();
			await expect.element(input).toHaveAttribute('type', 'range');
		});

		it('should have notifications toggle', async () => {
			const toggle = page.getByLabelText('Enable Notifications');
			await expect.element(toggle).toBeInTheDocument();
		});

		it('should have theme toggle options', async () => {
			// Look for text within toggle option buttons (they render as buttons in ToggleOptionsInput)
			const lightText = page.getByText('Light', { exact: true });
			const darkText = page.getByText('Dark', { exact: true });
			const autoText = page.getByText('Auto', { exact: true });

			await expect.element(lightText).toBeInTheDocument();
			await expect.element(darkText).toBeInTheDocument();
			await expect.element(autoText).toBeInTheDocument();
		});

		it('should have priority select dropdown', async () => {
			const select = page.getByLabelText('Priority Level');
			await expect.element(select).toBeInTheDocument();
		});
	});

	describe('Contact Info Form', () => {
		it('should have phone masked input', async () => {
			const input = page.getByLabelText('Phone Number');
			await expect.element(input).toBeInTheDocument();
		});

		it('should have credit card masked input', async () => {
			const input = page.getByLabelText('Credit Card');
			await expect.element(input).toBeInTheDocument();
		});

		it('should have SSN masked input', async () => {
			const input = page.getByLabelText('SSN');
			await expect.element(input).toBeInTheDocument();
		});
	});

	describe('Survey Form', () => {
		it('should have feedback textarea', async () => {
			const textarea = page.getByLabelText('Your Feedback');
			await expect.element(textarea).toBeInTheDocument();
		});

		it('should have rating number input', async () => {
			const input = page.getByLabelText('Rating (1-10)');
			await expect.element(input).toBeInTheDocument();
			await expect.element(input).toHaveAttribute('type', 'number');
		});

		it('should have subscribe checkbox', async () => {
			const checkbox = page.getByLabelText('Subscribe to newsletter');
			await expect.element(checkbox).toBeInTheDocument();
			await expect.element(checkbox).toHaveAttribute('type', 'checkbox');
		});

		it('should have contact method radio options', async () => {
			// Get the radio by specific labels used in the radio group
			const emailLabel = page.getByText('Email', { exact: true });
			const noneLabel = page.getByText('Do not contact');

			await expect.element(emailLabel).toBeInTheDocument();
			await expect.element(noneLabel).toBeInTheDocument();
		});
	});

	describe('Features section', () => {
		it('should list all key features', async () => {
			// Check for specific feature strong tags
			await expect.element(page.getByText('Type-safe:', { exact: true })).toBeInTheDocument();
			await expect
				.element(page.getByText('Preflight validation:', { exact: true }))
				.toBeInTheDocument();
			await expect.element(page.getByText('Validate modes:', { exact: true })).toBeInTheDocument();
			await expect.element(page.getByText('Password toggle:', { exact: true })).toBeInTheDocument();
			await expect.element(page.getByText('Masked inputs:', { exact: true })).toBeInTheDocument();
		});
	});
});
