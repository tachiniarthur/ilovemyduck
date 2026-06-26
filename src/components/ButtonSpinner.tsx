/**
 * Spinner pequeno para dentro de qualquer botão. Herda a cor do texto do botão
 * (border-current), então fica branco no botão primário e escuro no secundário
 * sem precisar de variações. O `.btn` já aplica gap, então basta renderizá-lo
 * antes do texto.
 */
export default function ButtonSpinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current"
    />
  );
}
