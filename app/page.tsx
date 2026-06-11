import FileUpload from './components/FileUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fdfcfb] bg-gradient-to-br from-pink-50 via-white to-blue-50 py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <div className="inline-block px-4 py-1.5 bg-pink-100/50 rounded-full text-pink-500 text-xs font-bold uppercase tracking-widest mb-2">
            Beta v1.0
          </div>
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            Bank Reconciliation
          </h1>
          <p className="text-lg text-gray-400 font-medium">
            Seamlessly match your Thai Bank statements with your internal ledger.
          </p>
        </header>

        <FileUpload />

        <footer className="pt-20 text-center text-gray-300 text-sm">
          Built with precision for financial accuracy
        </footer>
      </div>
    </main>
  );
}
