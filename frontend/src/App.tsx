// import { } from './services/gemini.ts'
import DirectoryPenal from './components/DirectoryPanel.tsx';
import EditorPanel from './components/EditorPanel.tsx';

function App() {
  return (
    <div className='flex'>
      <DirectoryPenal />
      <EditorPanel />
    </div>
  )
}

export default App