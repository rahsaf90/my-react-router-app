import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import LargeRHFTableSample from '~/components/forms/LargeRHFTableSample';

async function fillStepOneFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/customer name/i), 'Acme Corp');
  await user.type(screen.getByLabelText(/requester email/i), 'qa@acme.com');
  await user.type(screen.getByLabelText(/project code/i), 'PRJ-100');
  await user.type(screen.getByLabelText(/due date/i), '2026-12-31');
}

describe('LargeRHFTableSample', () => {
  it('blocks navigation to step 2 when step 1 is invalid', async () => {
    const user = userEvent.setup();
    render(<LargeRHFTableSample />);

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/customer name is required/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /add row/i })).not.toBeInTheDocument();
  });

  it('validates step 2 before moving to review', async () => {
    const user = userEvent.setup();
    render(<LargeRHFTableSample />);

    await fillStepOneFields(user);
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add row/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByText(/sku is required/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /save form/i })).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/sku/i), 'SKU-001');
    await user.type(screen.getByPlaceholderText(/description/i), 'Line item');

    const qtyInput = screen.getByPlaceholderText(/qty/i);
    await user.clear(qtyInput);
    await user.type(qtyInput, '2');

    const unitPriceInput = screen.getByPlaceholderText(/unit price/i);
    await user.clear(unitPriceInput);
    await user.type(unitPriceInput, '100');

    const discountInput = screen.getByPlaceholderText(/discount %/i);
    await user.clear(discountInput);
    await user.type(discountInput, '10');

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save form/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/total line items:/i)).toBeInTheDocument();
  });

  it('renders only a subset of rows when many line items exist', async () => {
    const user = userEvent.setup();
    render(<LargeRHFTableSample />);

    await fillStepOneFields(user);
    await user.click(screen.getByRole('button', { name: /next/i }));

    const addRowButton = await screen.findByRole('button', { name: /add row/i });

    for (let index = 0; index < 30; index += 1) {
      await user.click(addRowButton);
    }

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /remove/i }).length).toBeLessThan(31);
    });
    expect(screen.getAllByPlaceholderText(/sku/i).length).toBeLessThan(31);
  });
});
