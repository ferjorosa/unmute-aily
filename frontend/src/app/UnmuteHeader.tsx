import { Frank_Ruhl_Libre } from "next/font/google";
import Modal from "./Modal";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ailyLogo from "../assets/aily-logo.svg";

const frankRuhlLibre = Frank_Ruhl_Libre({
  weight: "400",
  subsets: ["latin"],
});

const ShortExplanation = () => {
  return (
    <p className="text-xs text-right">
      Real-time AI conversation for business decision support.
    </p>
  );
};

const UnmuteHeader = () => {
  return (
    <div className="flex flex-col gap-2 py-2 md:py-8 items-end max-w-80 md:max-w-60 lg:max-w-80">
      {/* kyutaiLogo */}
      <h1 className="text-3xl">Super Agent Pro</h1>
      <div className="flex items-center gap-2 -mt-1 text-xs">
        by
        <Link href="https://ailylabs.com" target="_blank" rel="noopener">
          <img src={ailyLogo.src} alt="Aily Labs logo" className="w-16" />
        </Link>
      </div>
      <ShortExplanation />
      <Modal
        trigger={
          <span className="flex items-center gap-1 text-lightgray">
            More info <ArrowUpRight size={24} />
          </span>
        }
        forceFullscreen={true}
      >
        <div className="flex flex-col gap-3">
          <p>
            Super Agent Pro is a real-time conversational AI prototype built by Aily Labs 
            using Kyutai's open-source TTS, STT, and Unmute services. 
            It combines speech-to-text, language models, and text-to-speech for natural voice interactions.
          </p>
          <p>
            This system processes your speech, generates intelligent responses, and speaks back 
            with low latency. You can customize the AI's personality and voice to match your needs.
          </p>
          <p>
            Aily Labs specializes in decision intelligence solutions that help businesses 
            make better, faster decisions with AI.
          </p>
          <p>
            Contact us:{" "}
            <Link
              href="mailto:info@ailylabs.com"
              target="_blank"
              rel="noopener"
              className="underline text-green"
            >
              info@ailylabs.com
            </Link>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default UnmuteHeader;
