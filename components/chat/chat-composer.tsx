"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatComposerProps = {
  onSubmit: (text: string) => void;
  disabled: boolean;
};

export function ChatComposer({ onSubmit, disabled }: ChatComposerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = value.trim();

    if (text.length === 0 || disabled) {
      return;
    }

    onSubmit(text);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-2 border-t border-zinc-200 bg-white px-4 py-4"
    >
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Escribe un mensaje"
        aria-label="Mensaje"
        autoComplete="off"
      />
      <Button type="submit" disabled={disabled || value.trim().length === 0}>
        Enviar
      </Button>
    </form>
  );
}
