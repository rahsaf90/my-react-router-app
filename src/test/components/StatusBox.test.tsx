/**
 * Unit tests for the StatusBox component.
 *
 * StatusBox applies a CSS class derived from the item name (via slugify)
 * and renders the item's name and value.
 */
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatusBox from '~/components/ui/StatusBox';
import { makeStatsBoxData } from '../utils';

// MUI components require a theme context
function renderWithTheme(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={createTheme()}>{ui}</ThemeProvider>,
  );
}

describe('StatusBox', () => {
  it('renders the item name', () => {
    const item = makeStatsBoxData({ name: 'Draft' });
    renderWithTheme(<StatusBox item={item} />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders the item value', () => {
    const item = makeStatsBoxData({ name: 'Draft', value: 12 });
    renderWithTheme(<StatusBox item={item} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('applies slugified CSS class from item name', () => {
    const item = makeStatsBoxData({ name: 'In Progress' });
    const { container } = renderWithTheme(<StatusBox item={item} />);
    // The root StyledBox receives the slugified class
    expect(container.firstChild).toHaveClass('in-progress');
  });

  it('applies "draft" class for Draft status', () => {
    const item = makeStatsBoxData({ name: 'Draft' });
    const { container } = renderWithTheme(<StatusBox item={item} />);
    expect(container.firstChild).toHaveClass('draft');
  });

  it('applies "approved" class for Approved status', () => {
    const item = makeStatsBoxData({ name: 'Approved' });
    const { container } = renderWithTheme(<StatusBox item={item} />);
    expect(container.firstChild).toHaveClass('approved');
  });

  it('renders a value of 0', () => {
    const item = makeStatsBoxData({ name: 'Cancelled', value: 0 });
    renderWithTheme(<StatusBox item={item} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
