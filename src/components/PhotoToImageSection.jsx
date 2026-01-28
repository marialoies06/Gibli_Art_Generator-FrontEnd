import Spinner from "./Spinner.jsx";
import UploadIcon from "./UploadIcon.jsx";
import ErrorMessage from "./ErrorMessage.jsx";
import {useCallback, useRef, useState} from "react";

const PhotoToImageSection = () => {
    const [uploadedImage, setUploadedImage] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [prompt, setPrompt] = useState('');
    // const [style, setStyle] = useState('general');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (file) => {
        if (file && file.type.startsWith('image/')) {
            setUploadedFile(file);
            setUploadedImage(URL.createObjectURL(file));
            setGeneratedImage(null);
            setError(null);
        } else {
            setError("Please upload a valid image file.");
            setUploadedImage(null);
            setUploadedFile(null);
        }
    };

    const handleDragOver = useCallback((e) => e.preventDefault(), []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) handleFileChange(files[0]);
    }, []);

    const onBrowseClick = () => fileInputRef.current.click();

    const handleGenerate = async () => {
        if (!uploadedFile) {
            setError("Please upload an image first!");
            return;
        }

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', uploadedFile);
        formData.append('prompt', prompt);
        //formData.append('style', style);

        try {
            const API_URL = 'http://localhost:8080/api/v1/generate';
            const response = await fetch(API_URL, { method: 'POST', body: formData });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Network response was not ok. Status: ${response.status}. Message: ${errorText}`);
            }

            const resultBlob = await response.blob();
            setGeneratedImage(URL.createObjectURL(resultBlob));

        } catch (err) {
            console.error('Error generating image:', err);
            setError("Failed to generate image. Please ensure the backend is running and check the console.");
        } finally {
            setIsLoading(false);
        }
    };

    const isCreateDisabled = isLoading || !uploadedFile || !!generatedImage;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {error && <ErrorMessage message={error} onClose={() => setError(null)} />}
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg flex flex-col">
                <h2 className="text-xl font-semibold mb-4">Photo to Ghibli Art</h2>
                <div className="flex-grow border-2 border-dashed border-gray-300 rounded-xl flex flex-col justify-center items-center text-center p-6 transition-colors" onDragOver={handleDragOver} onDrop={handleDrop}>
                    {uploadedImage ? (<img src={uploadedImage} alt="Uploaded preview" className="max-h-80 w-auto rounded-lg object-contain"/>) : (
                        <div>
                            <UploadIcon />
                            <p className="text-gray-600">Drag and drop your image here</p>
                            <p className="text-gray-500 text-sm my-2">or</p>
                            <button onClick={onBrowseClick} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Browse files</button>
                            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files[0])} className="hidden" accept="image/*" />
                        </div>
                    )}
                </div>
                <div className="mt-6 space-y-4">
                    {/*<GhibliStyleDropdown value={style} onChange={(e) => setStyle(e.target.value)} />*/}
                    <div>
                        <label htmlFor="prompt-photo" className="text-md font-semibold mb-2 block">Additional Details</label>
                        <textarea id="prompt-photo" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" rows="2" placeholder="Add any specific details or enhancements..."></textarea>
                    </div>
                </div>
                <button onClick={handleGenerate} disabled={isCreateDisabled} className="mt-6 bg-orange-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full">
                    Transform to Ghibli Art
                </button>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg flex flex-col justify-center items-center">
                <div className="w-full h-full flex justify-center items-center border-2 border-gray-200 rounded-xl bg-gray-50 min-h-[400px]">
                    {isLoading ? (<Spinner />) : generatedImage ? (<img src={generatedImage} alt="Generated Ghibli art" className="max-h-[32rem] w-auto rounded-lg object-contain"/>) : (
                        <p className="text-center text-gray-500 max-w-sm">Your generated Ghibli art will appear here.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PhotoToImage;