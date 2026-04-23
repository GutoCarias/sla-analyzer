import { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface Props {
  onFileParsed: (content: string, fileName: string) => void;
}

export default function FileUpload({ onFileParsed }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setError(null);
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setError('Por favor, selecione um arquivo .csv válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const buffer = e.target?.result as ArrayBuffer;
      if (!buffer) {
        setError('Não foi possível ler o arquivo.');
        return;
      }
      
      // Try UTF-8 first, fallback to ISO-8859-1 if it fails (common for Brazilian CSVs)
      const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
      try {
        const content = utf8Decoder.decode(buffer);
        onFileParsed(content, file.name);
      } catch (err) {
        const isoDecoder = new TextDecoder('iso-8859-1');
        const content = isoDecoder.decode(buffer);
        onFileParsed(content, file.name);
      }
    };
    reader.onerror = () => setError('Erro ao ler o arquivo.');
    reader.readAsArrayBuffer(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave() {
    setDragging(false);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-4
          border-2 border-dashed rounded-2xl p-12 cursor-pointer
          transition-all duration-200 select-none
          ${dragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
          }
        `}
      >
        <div className={`p-4 rounded-full transition-colors duration-200 ${dragging ? 'bg-blue-100' : 'bg-white shadow-sm'}`}>
          <UploadCloud className={`w-10 h-10 transition-colors duration-200 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-slate-700">
            {dragging ? 'Solte o arquivo aqui' : 'Arraste e solte seu arquivo CSV'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            ou <span className="text-blue-600 font-medium">clique para selecionar</span>
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Formato aceito: .CSV</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onChange}
        />
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
