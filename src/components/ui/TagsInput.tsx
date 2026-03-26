import { useState, useRef, type KeyboardEvent } from 'react';
import styles from './TagsInput.module.css';

interface TagsInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
}

export function TagsInput({ value, onChange, placeholder }: TagsInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()]);
      }
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className={styles.tagsInput}
      onClick={() => inputRef.current?.focus()}
      role="group"
      aria-label={placeholder}
    >
      {value.map((tag, i) => (
        <span key={i} className={styles.tag}>
          {tag}
          <button
            type="button"
            className={styles.tagRemove}
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            aria-label={`Remove ${tag}`}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        className={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
      />
    </div>
  );
}
