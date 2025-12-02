import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminStudyPlansPage from './page';

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
);

describe('AdminStudyPlansPage', () => {
  it('should open alert dialog on delete button click', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: '1',
              subject: 'Math',
              userInfo: { name: 'John Doe', email: 'john@example.com' },
              created_at: new Date().toISOString(),
            },
          ]),
      })
    );

    render(<AdminStudyPlansPage />);

    const deleteButton = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    const dialogTitle = await screen.findByText('Você tem certeza?');
    expect(dialogTitle).toBeInTheDocument();
  });
});