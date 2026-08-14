import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import { Badge } from '@/components/Badge';
import { RatingStars } from '@/components/RatingStars';
import { StatusBadge } from '@/components/StatusBadge';

describe('StatusBadge', () => {
  it('renders human-readable labels for booking statuses', async () => {
    await render(
      <>
        <StatusBadge status="REQUESTED" />
        <StatusBadge status="COMPLETED" />
        <StatusBadge status="DISPUTED" />
      </>,
    );
    expect(screen.getByText('Requested')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(screen.getByText('Disputed')).toBeTruthy();
  });
});

describe('Badge', () => {
  it('renders the Verified Pro label', async () => {
    await render(<Badge level="VERIFIED_PRO" />);
    expect(screen.getByText('Verified Pro')).toBeTruthy();
  });

  it('renders the Master label', async () => {
    await render(<Badge level="MASTER" size="md" />);
    expect(screen.getByText('Master')).toBeTruthy();
  });
});

describe('RatingStars', () => {
  it('exposes a fractional rating as an accessibility label', async () => {
    await render(<RatingStars rating={3.5} />);
    expect(screen.getByLabelText('Rating: 3.5 out of 5')).toBeTruthy();
  });

  it('exposes a zero rating as an accessibility label', async () => {
    await render(<RatingStars rating={0} />);
    expect(screen.getByLabelText('Rating: 0 out of 5')).toBeTruthy();
  });
});
