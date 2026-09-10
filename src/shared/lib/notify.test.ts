import { describe, expect, it, vi } from 'vitest';

const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock('sonner', () => ({
  toast: { success: (...args: unknown[]) => toastSuccessMock(...args), error: (...args: unknown[]) => toastErrorMock(...args) },
}));

import { notifyError, notifySuccess } from './notify';

describe('notify', () => {
  it('notifySuccess chama toast.success com a mensagem', () => {
    notifySuccess('Adicionado à estante.');
    expect(toastSuccessMock).toHaveBeenCalledWith('Adicionado à estante.');
  });

  it('notifyError chama toast.error com a mensagem', () => {
    notifyError('Não foi possível buscar livros agora.');
    expect(toastErrorMock).toHaveBeenCalledWith('Não foi possível buscar livros agora.');
  });
});
