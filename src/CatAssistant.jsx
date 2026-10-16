
import { useState } from "react";
import "./CatAssistant.css";

function CatAssistant() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isOpen && (
                <div className="cat-chat-panel">
                    <div className="cat-chat-header">
                        <span>🐱 SmartCRM Assistant</span>
                        <button
                            type="button"
                            className="cat-close"
                            onClick={() => setIsOpen(false)}
                        >
                            ×
                        </button>
                    </div>

                    <div className="cat-chat-body">
                        <p>Meow! 🐾</p>
                        <p>Hi! I'm your SmartCRM AI assistant.</p>
                        <p>How can I help you today?</p>
                    </div>
                </div>
            )}

            <button
                type="button"
                className="cat-assistant"
                onClick={(event) => {
                    event.stopPropagation();
                    setIsOpen((previous) => !previous);
                }}
            >
                <span className="cat-face">🐱</span>
                <span className="cat-label">Ask me!</span>
            </button>
        </>
    );
}

export default CatAssistant;
