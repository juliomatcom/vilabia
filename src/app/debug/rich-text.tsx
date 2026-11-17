const TOKEN = /(⟨[^⟩]+⟩|\/[^/\s]+\/)/g;

const isLetter = (part: string): boolean => part.startsWith('⟨') && part.endsWith('⟩');

const isSound = (part: string): boolean =>
  part.length > 2 && part.startsWith('/') && part.endsWith('/');

export const Rich = ({ text }: { text: string }) => (
  <>
    {text.split(TOKEN).map((part, index) =>
      isLetter(part) ? (
        <span
          key={index}
          className="rounded-sm bg-current/12 px-1 font-mono not-italic"
          title="letra escrita"
        >
          {part.slice(1, -1)}
        </span>
      ) : isSound(part) ? (
        <span key={index} className="font-mono italic opacity-90" title="sonido pronunciado">
          {part}
        </span>
      ) : (
        part
      ),
    )}
  </>
);

export const NotationKey = () => (
  <p className="text-xs opacity-70">
    <Rich text="⟨así⟩ se escribe · /aˈsi/ se pronuncia" />
  </p>
);
