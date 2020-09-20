# ReactSocialMediaTemplate
An open-source React.js social media webapp template using Firebase backend services.

## Description
Initially intended to be a private gaming social media platform, this ReactSocialMediaTemplate is a React.js application that includes features such as user authentication, posting, liking, sharing, commenting, profile viewing, and following services. It is highly functional and can be transformed to any social media platform that wishes to share videos/images. 
This React.js project uses Google Firebase as its backend to store uploaded media and store website details in a database. 
* To get a preview of this template in-action, visit https://react-gaming-sm.web.app/ 

## Configuring Firebase
You will need to have a Firebase project setup before using this template. In your project's Cloud Firestore create two collections, "posts" and "userData". In your project's Storage create two directories "images/" and "profiles/". Finally, obtain all details required by the "src/firebase.js" file in this repo and add them to it. Congrats! You have connected Firebase to this project. 

## How to use
This repo follows the same folder structure as a create-react-app. 
1. Ensure the installation of Node.js and npm.
2. After downloading this repo to a parent folder, using terminal, cd into the parent folder directory. 
3. Use command "npm install" to install dependecies listed in the package.json file.
4. Use command "npm start" to start running this webapp template in localhost:3000. 
5. Fix any src code errors, prompted by the browser.
5. If Firebase was configured correctly, you should have a working full-stack social media app. 

## Some notes to keep in mind
* Please make sure to look at the src code to find any Firebase Project specific variables. (ex) There is a global const DEFUALT_PROFPIC in Signup.js that is specific to my firebase project. Change it appropriately. 
* Project best works on Chrome Browsers. 


