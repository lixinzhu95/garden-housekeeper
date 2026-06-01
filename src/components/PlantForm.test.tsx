import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlantForm from '../components/PlantForm';

const noop = () => {};

describe('PlantForm', () => {
  describe('name validation', () => {
    it('shows error when submitting empty name', () => {
      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      fireEvent.submit(screen.getByRole('form'));
      expect(screen.getByRole('alert')).toHaveTextContent('请输入花草名称');
    });

    it('shows error when submitting whitespace-only name', async () => {
      const user = userEvent.setup();
      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      const input = screen.getByPlaceholderText('比如：绿萝');
      await user.clear(input);
      await user.type(input, '   ');
      fireEvent.submit(screen.getByRole('form'));
      expect(screen.getByRole('alert')).toHaveTextContent('请输入花草名称');
    });

    it('trims name before submit', async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      render(<PlantForm onSubmit={onSubmit} onCancel={noop} />);
      const input = screen.getByPlaceholderText('比如：绿萝');
      await user.clear(input);
      await user.type(input, '  绿萝  ');
      fireEvent.submit(screen.getByRole('form'));
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: '绿萝' }),
      );
    });
  });

  describe('interval validation', () => {
    it('shows error when watering interval is not finite', async () => {
      const user = userEvent.setup();
      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      const nameInput = screen.getByPlaceholderText('比如：绿萝');
      await user.clear(nameInput);
      await user.type(nameInput, '绿萝');
      const intervalInput = screen.getByLabelText('浇水周期（天）');
      await user.clear(intervalInput);
      await user.type(intervalInput, 'abc');
      fireEvent.submit(screen.getByRole('form'));
      expect(screen.getByRole('alert')).toHaveTextContent('周期需要大于 0');
    });

    it('shows error when watering interval is less than 1', async () => {
      const user = userEvent.setup();
      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      const nameInput = screen.getByPlaceholderText('比如：绿萝');
      await user.clear(nameInput);
      await user.type(nameInput, '绿萝');
      const intervalInput = screen.getByLabelText('浇水周期（天）');
      await user.clear(intervalInput);
      await user.type(intervalInput, '0');
      fireEvent.submit(screen.getByRole('form'));
      expect(screen.getByRole('alert')).toHaveTextContent('周期需要大于 0');
    });
  });

  describe('image removal', () => {
    it('does not show remove button when no image is set', () => {
      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      expect(screen.queryByRole('button', { name: '移除图片' })).toBeNull();
    });

    it('removes image when remove button is clicked', async () => {
      const user = userEvent.setup();

      const mockFileReader = function() {
        const instance: {
          result: string;
          onload: (() => void) | null;
          onerror: (() => void) | null;
          readAsDataURL: ReturnType<typeof vi.fn>;
        } = {
          result: 'data:image/png;base64,dGVzdA==',
          onload: null,
          onerror: null,
          readAsDataURL: vi.fn(function(this: typeof instance) {
            // Simulate async file reading by triggering onload
            setTimeout(() => {
              if (instance.onload) instance.onload();
            }, 0);
          }),
        };
        return instance;
      };

      const OriginalFileReader = globalThis.FileReader;
      vi.stubGlobal('FileReader', mockFileReader as unknown as typeof FileReader);

      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      const fileInput = screen.getByLabelText(/花草图片/);
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 });

      await user.upload(fileInput, file);
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: '移除图片' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: '移除图片' }));

      expect(screen.queryByRole('button', { name: '移除图片' })).toBeNull();

      vi.stubGlobal('FileReader', OriginalFileReader);
    });
  });

  describe('image validation', () => {
    it('shows error when image size exceeds 20MB', async () => {
      const user = userEvent.setup();
      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      const fileInput = screen.getByLabelText(/花草图片/);
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 25 * 1024 * 1024 });

      await user.upload(fileInput, file);
      expect(screen.getByRole('alert')).toHaveTextContent('图片不能超过 20MB');
    });

    it('successfully sets image when file is valid', async () => {
      const user = userEvent.setup();

      const mockFileReader = function() {
        const instance: {
          result: string;
          onload: (() => void) | null;
          onerror: (() => void) | null;
          readAsDataURL: ReturnType<typeof vi.fn>;
        } = {
          result: 'data:image/png;base64,dGVzdA==',
          onload: null,
          onerror: null,
          readAsDataURL: vi.fn(function(this: typeof instance) {
            // Simulate async file reading by triggering onload
            setTimeout(() => {
              if (instance.onload) instance.onload();
            }, 0);
          }),
        };
        return instance;
      };

      const OriginalFileReader = globalThis.FileReader;
      vi.stubGlobal('FileReader', mockFileReader as unknown as typeof FileReader);

      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      const fileInput = screen.getByLabelText(/花草图片/);
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 });

      await user.upload(fileInput, file);
      await vi.waitFor(() => {
        expect(screen.getByRole('img', { name: '花草预览' })).toBeInTheDocument();
      });

      expect(screen.queryByRole('alert')).toBeNull();

      vi.stubGlobal('FileReader', OriginalFileReader);
    });
  });

  describe('fertilizing interval validation', () => {
    it('shows error when fertilizing interval is not finite', async () => {
      const user = userEvent.setup();
      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      const nameInput = screen.getByPlaceholderText('比如：绿萝');
      await user.clear(nameInput);
      await user.type(nameInput, '绿萝');

      // fertilizing is already enabled by default when no plant is provided
      const intervalInput = screen.getByLabelText('施肥周期（天）');
      await user.clear(intervalInput);
      await user.type(intervalInput, 'abc');
      fireEvent.submit(screen.getByRole('form'));
      expect(screen.getByRole('alert')).toHaveTextContent('周期需要大于 0');
    });

    it('shows error when fertilizing interval is less than 1', async () => {
      const user = userEvent.setup();
      render(<PlantForm onSubmit={noop} onCancel={noop} />);
      const nameInput = screen.getByPlaceholderText('比如：绿萝');
      await user.clear(nameInput);
      await user.type(nameInput, '绿萝');

      // fertilizing is already enabled by default when no plant is provided
      const intervalInput = screen.getByLabelText('施肥周期（天）');
      await user.clear(intervalInput);
      await user.type(intervalInput, '0');
      fireEvent.submit(screen.getByRole('form'));
      expect(screen.getByRole('alert')).toHaveTextContent('周期需要大于 0');
    });
  });
});
