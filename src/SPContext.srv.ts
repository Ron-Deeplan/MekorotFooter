import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { IMekorotFooterWebPartWebPartProps } from "./webparts/mekorotFooterWebPart/MekorotFooterWebPartWebPart";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/fields";
import "@pnp/sp/views";
import "@pnp/sp/content-types";
import "@pnp/sp/site-users/web";
import "@pnp/sp/profiles";
import "@pnp/sp/subscriptions";

// import { graphfi, SPFx as graphSPFx } from "@pnp/graph";
// import { GraphFI } from "@pnp/graph/fi";
// import "@pnp/graph/teams";
// import "@pnp/graph/teams";
// import "@pnp/graph/planner";
// import "@pnp/graph/users";
// import "@pnp/graph/messages";

export class SPContextService {
    private static spfxContext: WebPartContext;
    private static sp: SPFI;
    // private static graph: GraphFI;
    private static props: IMekorotFooterWebPartWebPartProps;

    private constructor() { }

    public static initialize(context: WebPartContext, props: IMekorotFooterWebPartWebPartProps): void {
        SPContextService.spfxContext = context;
        SPContextService.props = props;
    }

    public static getContext(): WebPartContext {
        if (!SPContextService.spfxContext) {
            throw new Error("SPFx context has not been initialized. Call initialize() first.");
        };

        return SPContextService.spfxContext;
    };

    public static getSP(): SPFI {
        if (!SPContextService.sp) {
            SPContextService.sp = spfi().using(SPFx(SPContextService.spfxContext));
        };

        return SPContextService.sp;
    };

    public static getSPByPath(path: string): SPFI {
        return spfi(path).using(SPFx(SPContextService.spfxContext));
    };

    // public static getGraph(): GraphFI {
    //     if (!SPContextService.graph) {
    //         SPContextService.graph = graphfi().using(graphSPFx(SPContextService.spfxContext));
    //     };

    //     return SPContextService.graph;
    // };

    public static getProps(): IMekorotFooterWebPartWebPartProps {
        return SPContextService.props;
    }

    public static isRunningOnLocalhost(): boolean {
        return SPContextService.getContext().isServedFromLocalhost;
    }
}
