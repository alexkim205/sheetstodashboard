import {urlToAction} from "kea-router";
import {actions, afterMount, connect, kea, path, reducers} from "kea";
import {SceneKey, urls, urlsToScenes} from "../utils/routes";
import type {sceneLogicType} from "./sceneLogicType";
import {userLogic} from "./userLogic";
import {demoData} from "../components/Demo/demo.data";

export const sceneLogic = kea<sceneLogicType>([
    path(["src", "routerLogic"]),
    actions({
        setScene: (scene: SceneKey, params: Record<string, string>) => ({
            scene,params
        }),
        setDomain: (domain: string | null) => ({domain})
    }),
    connect({
        values: [userLogic, ["user"]],
        actions: [userLogic, ["setUser"]]
    }),
    reducers({
        scene: [
            SceneKey.Home as SceneKey,
            {
                setScene: (_, payload) => payload.scene,
            },
        ],
        params: [
            {} as Record<string, string>,
            {
                setScene: (_, payload) => payload.params
            }
        ],
        domain: [
            null as string | null,
            {
                setDomain: (_, {domain}) => domain
            }
        ]
    }),
    urlToAction(({ actions, values }) => {
        return Object.fromEntries(
            Object.entries(urlsToScenes).map(([path, scene]) => {
                return [path, (params) => {
                    // set and unset demo user depending on scene
                    if (path === urls.demo_dashboard()) {
                        actions.setUser(demoData.user)
                    } else if (values.user?.user?.email === "test@gmail.com") {
                        actions.setUser(null)
                    }
                    actions.setScene(scene as SceneKey, params as Record<string, string>)
                }];
            })
        );
    }),
    afterMount(({actions}) => {
        const host = window.location.host
        const arr = host.split(".").slice(0, host.includes("localhost") ? -1 : -2);
        const isCustomDomain = import.meta.env.DEV ? false : !host.endsWith("sheetstodashboard.com")
        const isDefaultDomain = arr.length > 0 && arr[0] !== "www"
        if (isCustomDomain || isDefaultDomain) {
            if (isCustomDomain) {
                actions.setDomain(host)
            } else {
                actions.setDomain(arr[0])
            }
            actions.setScene(SceneKey.PublicDashboard, {})
        }
    })
]);
