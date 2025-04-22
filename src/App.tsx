import { useState, useEffect } from 'react';
import { MxBuilder, LayerInfo } from './MxGraph/MxBuilder';
import { formatXml } from './utils/xml';

export default function App() {
  const [xmlInput, setXmlInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [layers, setLayers] = useState<LayerInfo[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    try {
      const builder = MxBuilder.fromXml(xmlInput);
      const detectedLayers = builder.listLayers();
      setLayers(detectedLayers);
      if (detectedLayers.length > 0) {
        setSelectedLayerId(detectedLayers[0].id);
      }
      setAvailableTags(builder.listTags());
    } catch {
      setLayers([]);
      setSelectedLayerId(null);
      setAvailableTags([]);
    }
  }, [xmlInput]);

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
      const selectedLayer = builder.listLayers().find(l => l.id === selectedLayerId);
      const id = 'template-' + Date.now();

      // const userObject = builder.createTaggedTemplate(id, 300, 200, selectedLayer, selectedTags);
      // builder.model.root.add(userObject);

      

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

      {layers.length > 0 && (
        <div>
          <label className="font-semibold block mb-1">Selecionar Camada:</label>
          <select
            className="p-2 border rounded w-full max-w-sm"
            value={selectedLayerId || ''}
            onChange={(e) => setSelectedLayerId(e.target.value)}
          >
            {layers.map((layer) => (
              <option key={layer.id} value={layer.id}>
                {layer.label || layer.id}
              </option>
            ))}
          </select>
        </div>
      )}

      {availableTags.length > 0 && (
        <div>
          <label className="font-semibold block mb-1">Tags para aplicar ao novo template:</label>
          <select
            multiple
            className="p-2 border rounded w-full max-w-sm"
            value={selectedTags}
            onChange={(e) =>
              setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))
            }
          >
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      )}

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
          disabled={!selectedLayerId}
        >
          ➕ Adicionar Template
        </button>
      </div>
    </div>
  );
}
