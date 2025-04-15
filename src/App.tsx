import { useState } from 'react';
import { MxBuilder } from './MxGraph/MxBuilder';
import { formatXml } from './utils/xml';

export default function App() {
  const [xmlInput, setXmlInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xmlInput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar o XML', err);
    }
  };

  const handleAddTemplate = () => {
    try {
      const builder = MxBuilder.fromXml(xmlInput);
      builder.addTemplate('template-' + Date.now(), 300, 200);
      setXmlInput(formatXml(builder.toXmlString()));
    } catch (e: any) {
      alert('❌ Erro ao adicionar template: ' + e.message);
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Criador de Menu de Camadas para Draw.io</h1>

      <textarea
        id="textarea"
        className="w-full h-72 p-2 border rounded font-mono text-sm"
        value={xmlInput}
        onChange={(e) => setXmlInput(e.target.value)}
        placeholder="Cole seu XML .drawio aqui (ou gere com MxBuilder)..."
      />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {copied ? '✅ Copiado!' : '📋 Copiar XML'}
        </button>

        <button
          onClick={handleAddTemplate}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          ➕ Adicionar Template
        </button>
      </div>
    </div>
  );
}
