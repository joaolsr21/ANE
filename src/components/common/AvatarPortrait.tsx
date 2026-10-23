import React, { useRef, useState } from 'react';
import { Camera, Link2, Trash2, User, Skull, Check, X, Pencil } from 'lucide-react';

interface AvatarPortraitProps {
  imageUrl: string | null;
  name: string;
  isNpc?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onChangeImage?: (newUrl: string | null) => void;
}

export const AvatarPortrait: React.FC<AvatarPortraitProps> = ({
  imageUrl,
  name,
  isNpc = false,
  size = 'md',
  editable = true,
  onChangeImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showUrlPopover, setShowUrlPopover] = useState(false);
  const [touchActionsOpen, setTouchActionsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(imageUrl || '');

  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-16 h-16 sm:w-20 sm:h-20 text-lg',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl',
  }[size];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onChangeImage) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangeImage(reader.result);
        setTouchActionsOpen(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onChangeImage) return;
    onChangeImage(urlInput.trim() || null);
    setShowUrlPopover(false);
    setTouchActionsOpen(false);
  };

  return (
    <div className="relative inline-block group shrink-0">
      <div
        className={`${sizeClasses} rounded-xl overflow-hidden border-2 flex items-center justify-center relative bg-bg-main ${
          isNpc
            ? 'border-primary-blood/70 shadow-blood-glow'
            : 'border-secondary-uv/70 shadow-uv-glow'
        }`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-ash">
            {isNpc ? (
              <Skull className="w-1/2 h-1/2 text-primary-blood" />
            ) : (
              <User className="w-1/2 h-1/2 text-secondary-uv" />
            )}
            <span className="font-mono font-bold uppercase text-[10px] mt-0.5 text-text-main">
              {name.slice(0, 2)}
            </span>
          </div>
        )}

        {/* Overlay de Edição de Foto (Visível ao passar o mouse no PC ou ao tocar no botão de câmera no Celular) */}
        {editable && onChangeImage && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute inset-0 bg-bg-main/90 transition-opacity flex items-center justify-center gap-1 p-1 ${
              touchActionsOpen
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Enviar foto do dispositivo"
              className="p-1.5 rounded-lg bg-secondary-uv text-text-main hover:bg-secondary-uv/80"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setUrlInput(imageUrl || '');
                setShowUrlPopover((v) => !v);
              }}
              title="Inserir link (URL) da imagem"
              className="p-1.5 rounded-lg bg-bg-card border border-muted-ash/30 text-text-main hover:border-secondary-uv"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>

            {imageUrl && (
              <button
                type="button"
                onClick={() => {
                  onChangeImage(null);
                  setTouchActionsOpen(false);
                }}
                title="Excluir foto"
                className="p-1.5 rounded-lg bg-primary-blood text-text-main hover:bg-primary-blood/80"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Botão flutuante no canto inferior direito para abrir opções no Celular (Touch) */}
      {editable && onChangeImage && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setTouchActionsOpen((v) => !v);
          }}
          title="Editar foto"
          className="md:hidden absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-secondary-uv border border-bg-main text-text-main flex items-center justify-center shadow-lg"
        >
          {touchActionsOpen ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
        </button>
      )}

      {/* Popover para colar URL de imagem */}
      {showUrlPopover && onChangeImage && (
        <form
          onSubmit={handleApplyUrl}
          onClick={(e) => e.stopPropagation()}
          className="absolute z-50 top-full left-0 mt-2 w-60 sm:w-64 bg-bg-card border border-secondary-uv rounded-xl p-2.5 shadow-2xl flex items-center gap-1.5"
        >
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/foto.jpg"
            className="flex-1 min-w-0 bg-bg-main border border-muted-ash/30 rounded-lg px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-secondary-uv"
          />
          <button
            type="submit"
            title="Salvar URL"
            className="p-1.5 rounded-lg bg-secondary-uv text-text-main shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowUrlPopover(false)}
            className="p-1.5 rounded-lg bg-bg-main text-muted-ash hover:text-text-main shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
};
