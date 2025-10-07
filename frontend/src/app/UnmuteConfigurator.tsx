import { useEffect, useState } from "react";

export type LanguageCode = "en" | "fr" | "en/fr" | "fr/en";

export type ConstantInstructions = {
  type: "constant";
  text: string;
  language?: LanguageCode;
};

export type Instructions =
  | ConstantInstructions
  | { type: "smalltalk"; language?: LanguageCode }
  | { type: "guess_animal"; language?: LanguageCode }
  | { type: "quiz_show"; language?: LanguageCode }
  | { type: "unmute_explanation"; language?: LanguageCode }
  | { type: "news"; language?: LanguageCode }
  | { type: "sanofi_pharma"; language?: LanguageCode };

export type UnmuteConfig = {
  instructions: Instructions;
  voice: string;
  // The backend doesn't care about this, we use it for analytics
  voiceName: string;
  // The backend doesn't care about this, we use it for analytics
  isCustomInstructions: boolean;
};

// Will be overridden immediately by the voices fetched from the backend
export const DEFAULT_UNMUTE_CONFIG: UnmuteConfig = {
  instructions: {
    type: "smalltalk",
    language: "en/fr",
  },
  voice: "barack_demo.wav",
  voiceName: "Missing voice",
  isCustomInstructions: false,
};

export type FreesoundVoiceSource = {
  source_type: "freesound";
  url: string;
  start_time: number;
  sound_instance: {
    id: number;
    name: string;
    username: string;
    license: string;
  };
  path_on_server: string;
};

export type FileVoiceSource = {
  source_type: "file";
  path_on_server: string;
  description?: string;
  description_link?: string;
};

export type VoiceSample = {
  name: string | null;
  comment: string;
  good: boolean;
  instructions: Instructions | null;
  source: FreesoundVoiceSource | FileVoiceSource;
};

// Simplified configurator - no longer needs voice fetching or selection

const UnmuteConfigurator = ({
  config,
  backendServerUrl,
  setConfig,
}: {
  config: UnmuteConfig;
  backendServerUrl: string;
  setConfig: (config: UnmuteConfig) => void;
  voiceCloningUp: boolean;
}) => {
  const [voices, setVoices] = useState<VoiceSample[] | null>(null);

  useEffect(() => {
    // Hardcoded voice configuration - uncomment the one you want to use
    if (backendServerUrl && voices === null) {
      // Set a dummy voices array to indicate loading is complete
      setVoices([]);
      
      // ========== VOICE OPTIONS - UNCOMMENT ONE ==========
      
      // 🎯 FEMALE VOICE (Currently Active) - Sanofi Pharma Assistant
      setConfig({
        ...config,
        voice: "unmute-prod-website/ex04_narration_longform_00001.wav",
        voiceName: "Female",
        instructions: { type: "sanofi_pharma", language: "en" },
        isCustomInstructions: false,
      });
      
      // 📰 MALE VOICE - Václav from Kyutai - Sanofi Pharma Assistant
      // setConfig({
      //   ...config,
      //   voice: "unmute-prod-website/developer-1.mp3",
      //   voiceName: "Male",
      //   instructions: { type: "sanofi_pharma", language: "en" },
      //   isCustomInstructions: false,
      // });
    }
  }, [backendServerUrl, config, setConfig, voices]);

  if (!voices) {
    return (
      <div className="w-full">
        <p className="text-lightgray">Loading...</p>
      </div>
    );
  }

  // Return a minimal interface - no voice selection or instructions
  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden configurator - using Sanofi Pharma Assistant voice */}
      <div className="w-full max-w-6xl px-3 py-2">
        <p className="text-xs text-center text-lightgray">
          Using {config.voiceName} voice for Sanofi Pharma Assistant
        </p>
      </div>
    </div>
  );
};

export default UnmuteConfigurator;
