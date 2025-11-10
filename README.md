# SchoolTools
Welcome! This is the development GitHub repository for SchoolTools, available at https://schooltools.lunarsphere.net/

If you'd like to set SchoolTools up for yourself, check the [development setup guide](#development) and [code licensing requirements](#licensing)

# Development
To set up code development for yourself, you should be running Linux, or a Linux container (such as WSL for Windows). Setting up is easy. Open a Linux terminal, and then:

1. Make sure you have __Node.js__ and __npm__ installed. See the [Node.js download page](https://nodejs.org/en/download) for more details.
2. Clone this repository, using `git clone https://github.com/charnam/schooltools.git`
3. Open the newly-created directory, using `cd schooltools/`
4. Run `npm install` to download all required dependencies.
5. Finally, run `node index.js` to start the development server.

Upon making any changes to code in the `server/` directory, you will need to interrupt and re-run `node index.js` to cause your changes to be reflected.

*Note: AI-heavy pull requests may be completely ignored if effort is not put into human understanding of __every line__ of added code. If a human wrote the code, they'd understand it. Unfortunately, so far, AI will often make mistakes and add unnecessary changes. It is up to you to verify and read your code, and up to me to make sure your changes function properly.*

# Licensing
All code in this repository is licensed under the GNU aGPL version 3.0 or later.
