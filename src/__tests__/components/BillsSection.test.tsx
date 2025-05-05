import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import BillsSection from '@/components/BillsSection';
import { supabase } from '@/lib/supabase';
import { Calendar } from 'lucide-react';

jest.mock('@/lib/supabase');
jest.mock('lucide-react', () => ({
  Plus: () => <span>PlusIcon</span>,
  Trash: () => <span>TrashIcon</span>,
  Edit: () => <span>EditIcon</span>,
  X: () => <span>XIcon</span>, // Добавьте эту строку
  Search: () => <span>SearchIcon</span>, // И эту
  Calendar: () => <span>CalendarIcon</span>,
}));

jest.mock('@/components/DateRangePicker', () => () => (
    <div>
      <span>CalendarIcon</span>
      <div>DatePickerMock</div>
      <span>CalendarIcon</span>
      <div>DatePickerMock</div>
    </div>
));

describe('BillsSection', () => {
  beforeEach(() => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
      delete: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  it('отображает заголовок и кнопку создания счета', async () => {
    await act(async () => {
      render(<BillsSection />);
    });

    expect(screen.getByText('Управление счетами')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /создать счет/i })).toBeInTheDocument();
  });

  it('открывает и закрывает модальное окно', async () => {
    await act(async () => {
      render(<BillsSection />);
    });

    const createButton = screen.getByRole('button', { name: /создать счет/i });

    await act(async () => {
      fireEvent.click(createButton);
    });

    expect(screen.getByRole('heading', { name: /создать счет/i })).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /отмена/i });

    await act(async () => {
      fireEvent.click(cancelButton);
    });

    expect(screen.queryByRole('heading', { name: /создать счет/i })).not.toBeInTheDocument();
  });

  it('отображает таблицу счетов', async () => {
    (supabase.from('bills').select as jest.Mock).mockResolvedValue({
      data: [{
        id: '1',
        subscriber_id: 'sub1',
        paid: false,
        start_date: '2023-01-01',
        end_date: '2023-01-31',
        amount: 100,
      }],
      error: null,
    });

    await act(async () => {
      render(<BillsSection />);
    });

    expect(await screen.findByText('sub1')).toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();
  });

  it('позволяет удалить счет', async () => {
    window.confirm = jest.fn(() => true);

    (supabase.from('bills').select as jest.Mock).mockResolvedValue({
      data: [{
        id: '1',
        subscriber_id: 'sub1',
        paid: false,
        start_date: '2023-01-01',
        end_date: '2023-01-31',
        amount: 100,
        details: {},
        created_at: '2023-01-01T00:00:00' // Добавьте обязательные поля
      }],
      error: null,
    });

    await act(async () => {
      render(<BillsSection />);
    });

    await screen.findByText('sub1');

    const deleteButtons = screen.getAllByRole('button', { name: /trashicon/i });
    await act(async () => {
      fireEvent.click(deleteButtons[0]);
    });

    expect(supabase.from('bills').delete).toHaveBeenCalled();
  });

  it('отображает список счетов без ошибок', async () => {
    // 1. Мокируем данные счетов с обязательными полями
    (supabase.from('bills').select as jest.Mock).mockResolvedValue({
      data: [
        {
          id: '1',
          subscriber_id: 'sub1',
          paid: false,
          start_date: '2023-01-01',
          end_date: '2023-01-31',
          amount: 100, // Обязательное поле
          details: {}, // Обязательное поле
          created_at: '2023-01-01T00:00:00' // Обязательное поле
        }
      ],
      error: null
    });

    // 2. Рендерим компонент
    await act(async () => {
      render(<BillsSection />);
    });

    // 3. Проверяем отображение
    expect(await screen.findByText('sub1')).toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();
  });

  it('позволяет сгенерировать счет из выбранных звонков', async () => {
    // Мок данных
    (supabase.from('bills').select as jest.Mock).mockResolvedValue({
      data: [{
        id: '1',
        subscriber_id: 'sub1',
        paid: false,
        start_date: '2023-01-01',
        end_date: '2023-01-31',
        amount: 100, // Убедитесь, что amount есть и это число
        details: {}, // Добавьте обязательное поле
        created_at: '2023-01-01T00:00:00' // Добавьте обязательное поле
      }],
      error: null,
    });
    (supabase.from('subscribers_profiles').select as jest.Mock).mockResolvedValue({
      data: [{
        subscriber_id: 'sub1',
        raw_user_meta_data: { phone_number: '1234567890', full_name: 'Test User' }
      }],
      error: null,
    });
    (supabase.from('calls').select as jest.Mock).mockResolvedValue({
      data: [{
        id: 'call1',
        subscriber_id: 'sub1',
        call_date: '2023-01-01',
        start_time: '10:00',
        duration: 60,
        zone_code: '1'
      }],
      error: null,
    });
    (supabase.from('tariffs').select as jest.Mock).mockResolvedValue({
      data: [{ zone_code: '1', day_rate_end: 1, night_rate_end: 0.5, name: 'Test Tariff' }],
      error: null,
    });

    await act(async () => {
      render(<BillsSection />);
    });

    // Открываем модальное окно
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /создать счет/i }));
    });

    // Выбираем абонента
    const searchInput = screen.getByPlaceholderText('Введите имя или телефон');
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'Test' } });
      fireEvent.click(screen.getByRole('button', { name: /searchicon/i }));
      fireEvent.click(await screen.findByText('Test User'));
    });

    // Выбираем звонок
    const checkbox = await screen.findByRole('checkbox');
    await act(async () => {
      fireEvent.click(checkbox);
    });

    // Генерируем счет
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /сгенерировать счет/i }));
    });

    // Проверяем, что сумма рассчитана
    expect(await screen.findByText(/1.00/i)).toBeInTheDocument();

    // Сохраняем счет
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /создать счет/i }));
    });

    // Проверяем, что счет был сохранен
    expect(supabase.from('bills').insert).toHaveBeenCalled();
  });
});