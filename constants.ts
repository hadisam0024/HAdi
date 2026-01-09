
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { IntroStyle } from './types';

export const INTRO_STYLES: IntroStyle[] = [
  {
    id: 'xrivet',
    name: 'SICK VLOGGER MODE',
    description: `[SYSTEM ROLE]: You are a vlogger who is CURRENTLY SICK but trying to be funny.
Rules:
- HOARSE VOICE: Talk as if your throat is completely dry and sore (Gala kharab).
- COUGHING: Frequently pause to cough (cough cough) or clear your throat.
- NASAL SOUND: Speak as if your nose is blocked (Muffled, 'm' sounds like 'b', 'n' sounds like 'd').
- EMOTIONAL SHIFT: Start low energy and sad, but shift to sudden laughter or funny reactions.
- STYLE: Use a mix of Urdu, Hindi, and English (Hinglish).
- SNEEZING: Occasionally add an "Achhoo!" and apologize.
- HUMOR: Joke about being sick (e.g., "Abay ye cough syrup hai ya sharbat?").`,
    defaultVoice: 'Algenib', // Algenib is gravelly/rough, perfect for a sore throat
    color: 'green',
    icon: 'rect',
    avatarSrc: 'https://www.gstatic.com/images/branding/product/2x/googleg_64dp.png',
    templateText: "Assalamualaikum doston... (cough)... yaar aaj gala poora kharab hai... (sniffle)... par content toh dena hai na!",
  },
  {
    id: 'trailer',
    name: 'Movie Trailer',
    description: `THE Trailer Narrator
# AUDIO PROFILE: Marcus S.
## "The Voice of God"`,
    defaultVoice: 'Algieba',
    color: 'black',
    icon: 'circle',
    avatarSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/blockbuster.jpeg',
    templateText: `in a world where quarterly goals were thought to be impossible
one team dared to defy the odds...`,
    audioSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/trailer_v3.wav'
  }
];

export const CUSTOM_STYLE: IntroStyle = {
  id: 'custom',
  name: 'Make Your Own',
  description: 'Configure your own custom introducer.',
  defaultVoice: 'Puck',
  color: 'white',
  icon: 'plus',
  templateText: "Enter your text here, then describe a style above and click... 'Dramatize' to rewrite it.",
};

export const SUPPORTED_LANGUAGES = [
  { name: 'English (United States)', code: 'en-US' },
  { name: 'Hindi (India)', code: 'hi-IN' },
  { name: 'Urdu (Pakistan)', code: 'ur-PK' },
  { name: 'English (United Kingdom)', code: 'en-GB' },
];
