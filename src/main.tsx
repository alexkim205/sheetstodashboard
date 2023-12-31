import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import {NextUIProvider} from "@nextui-org/react";
import {Slide, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css';
import {resetContext} from 'kea'
import {createPostHogClient} from "./utils/analytics";
import {localStoragePlugin} from "kea-localstorage";

resetContext({
    plugins: [localStoragePlugin],
})

createPostHogClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <NextUIProvider>
        <App/>
        <ToastContainer
            position="bottom-center"
            transition={Slide}
            autoClose={3000}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            bodyClassName="text-sm"
        />
    </NextUIProvider>
)
