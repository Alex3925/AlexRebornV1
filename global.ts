import type * as Cass from "cassidy-userData";
import type {
  generateGift,
  generateTrash,
  generateChequeGift,
  generateTrashOld,
  treasureInv,
  UTShop,
} from "./CommandFiles/plugins/ut-shop.js";
import type { Inventory, Collectibles } from "@cass-modules/InventoryEnhanced";

import type { ReplySystem, ReactSystem } from "input-cassidy";

import type OutputX from "output-cassidy";
import type { OutputProps, StrictOutputForm } from "output-cassidy";
import { CassEXP } from "./CommandFiles/modules/cassEXP.js";
import type { GameSimulator } from "./CommandFiles/types/gamesimu.d.ts";
import GlobalUtilsX from "./CommandFiles/types/utils-type";
import type * as UNIUtils from "@cass-modules/unisym";
import * as _CassidyUser from "./CommandFiles/modules/cassidyUser";

declare global {
  var controllers: {
    Users: ReturnType<typeof getCUser>;
  };
  export import Datum = _Datum;
  var api: CommandContext["api"];
  export type TOnCallCommand = XaviaTypes.TOnCallCommand;
  export type TOnCallEvents = XaviaTypes.TOnCallEvents;
  export type TOnCallOnMessage = XaviaTypes.TOnCallOnMessage;
  export type TReplyCallback = XaviaTypes.TReplyCallback;
  export type TReactCallback = XaviaTypes.TReactCallback;

  var package: typeof import("./package.json");
  var logger: typeof import("./Cassidy.js").logger;

  interface CommandMeta extends CassidySpectra.CommandMeta {}
  interface Command extends CassidySpectra.CassidyCommand {}
  interface CommandStyle extends CassidySpectra.CommandStyle {}
  interface CassidyCommand extends CassidySpectra.CassidyCommand {}

  type InventoryConstructor = typeof Inventory;
  type CollectiblesConstructor = typeof Collectibles;
  type GameSimulatorConstructor = typeof GameSimulator;

  export type AnyRecord = Record<string, any>;

  export type AnyConstructor = new (...args: any[]) => any;

  interface CommandContextOG {
    /**
     * Syntactical Sugar for FS
     */
    Files: typeof Files;
    /**
     * NeaxScript
     */
    NeaxScript: typeof NeaxScript;
    /**
     * Sets of UNICodes
     */
    UNISpectra: typeof UNISpectra;
    /**
     * Imported from unisym.
     */
    UNIUtils: typeof UNIUtils;
    /**
     * Useful tools maybe.
     */
    SmartSpectra: typeof SmartSpectra;
    /**
     * Manages user statistics and data.
     */
    money: Cass.UserStatsManager;

    /**
     * Handles inventory-related operations.
     */
    Inventory?: typeof Inventory;

    /**
     * Manages collectible items for users.
     */
    Collectibles?: typeof Collectibles;

    /**
     * Represents input data and utilities for commands.
     */
    input: InputClass;
    /**
     * A special and relatively new class to create an input data for commands.
     */
    InputClass: typeof InputClass;

    /**
     * Handles output operations and responses.
     */
    output: OutputProps;
    /**
     * Contains arguments passed to the command.
     */
    args: string[];

    /**
     * Cancels the cooldown for the current command.
     */
    cancelCooldown?: () => void;

    /**
     * Stores the name of the current command being executed.
     */
    commandName?: string;

    /**
     * Represents the prefix used for commands.
     */
    prefix: string;

    /**
     * Contains all valid prefixes for commands.
     */
    prefixes: string[];

    /**
     * Manages experience points and levels for users.
     */
    CassEXP: typeof CassEXP;

    /**
     * Stores all available commands.
     */
    commands: CassidySpectra.GlobalCassidy["commands"];

    /**
     * Represents the current command being executed.
     */
    command?:
      | CassidySpectra.CassidyCommand
      | Partial<CassidySpectra.CassidyCommand>;

    /**
     * Caches user data for the current session.
     */
    userDataCache?: UserData;

    /**
     * Provides game simulation utilities.
     */
    GameSimulator: typeof GameSimulator;

    /**
     * @deprecated Handles reply system operations.
     */
    replySystem?: ReplySystem;

    /**
     * @deprecated Handles reaction system operations.
     */
    reactSystem?: ReactSystem;

    /**
     * Manages thread-related user statistics.
     */
    threadsDB: UserStatsManager;

    /**
     * Manages user-related statistics.
     */
    usersDB: UserStatsManager;

    /**
     * Manages global statistics.
     */
    globalDB: UserStatsManager;

    /**
     * Provides access to the API for external operations.
     * Uses XaviaBot Types.
     */
    api: API & IFCAU_API;

    /**
     * Represents the event data for the current command.
     * Uses XaviaBot Types.
     */
    event: Extract<IFCAU_ListenMessage, { type: "message" | "messageReply" }>;

    /**
     * Contains all loaded plugins.
     */
    allPlugins: { [key: string]: any };

    /**
     * Stores queued operations or commands.
     */
    queue: any[][];

    /**
     * @deprecated Provides access to the original API.
     */
    origAPI: API;

    /**
     * Indicates whether the command has a prefix.
     */
    hasPrefix: boolean;

    /**
     * @deprecated Tracks inventory time for operations.
     */
    invTime: number;

    /**
     * Represents the icon associated with the command or context.
     */
    icon: string;

    /**
     * Provides global Cassidy-specific utilities and configurations.
     */
    Cassidy: CassidySpectra.GlobalCassidy;

    /**
     * @deprecated Tracks the number of safe calls made.
     */
    safeCalls: number;

    /**
     * Provides access to Discord-specific API operations.
     */
    discordApi: API;

    /**
     * Provides access to page-specific API operations.
     */
    pageApi: API;

    /**
     * @deprecated Tracks the stack of awaiting operations.
     */
    awaitStack: { [key: string]: string[] };

    /**
     * @deprecated Adds an operation to the await stack.
     */
    setAwaitStack: (id: string, key: string) => void;

    /**
     * @deprecated Removes an operation from the await stack.
     */
    delAwaitStack: (id: string, key: string) => void;

    /**
     * @deprecated Checks if an operation exists in the await stack.
     */
    hasAwaitStack: (id: string, key: string) => boolean;

    /**
     * @deprecated Clears the current stack of operations.
     */
    clearCurrStack: () => void;

    /**
     * Represents the entire command context object.
     */
    allObj: CommandContext;

    /**
     * Manages user statistics for the current session.
     */
    userStat: Cass.UserStatsManager;

    /**
     * Proceeds to the next middleware or operation in the pipeline.
     */
    next?: () => void;

    /**
     * @deprecated Provides styling utilities for responses.
     */
    styler?: CassidyResponseStylerControl;

    /**
     * @deprecated Provides styling utilities for responses.
     */
    stylerDummy?: CassidyResponseStylerControl;

    /**
     * Represents the current command context.
     */
    ctx: CommandContext;

    /**
     * @deprecated Indicates whether the current context is a command.
     */
    isCommand?: true | undefined;

    /**
     * Provides access to the shop class for managing purchases.
     */
    ShopClass?: typeof import("@cass-plugins/shopV2.js").ShopClass;

    /**
     * Sends an old-style output response.
     */
    outputOld?: OutputProps["dispatch"];

    /**
     * Retrieves the language-specific text for the context.
     */
    getLang?: ReturnType<LangParser["createGetLang"]>;

    /**
     * Provides access to the language parser for translations.
     */
    langParser: LangParser;

    /**
     * User roles (2 for bot admin, 1.5 for moderator, 1 for thread admin, 0 for everyone.)
     */
    role: InputRoles;

    /**
     * Role for current command (from command meta or custom role on db) (2 for bot admin, 1.5 for moderator, 1 for thread admin, 0 for everyone.)
     */
    commandRole: InputRoles | undefined;

    /**
     * User roles as enum.
     */
    InputRoles: typeof InputRoles;

    /**
     * @deprecated Tracks popular commands used by users.
     */
    popularCMD?: AnyRecord;

    /**
     * @deprecated Tracks recently used commands by users.
     */
    recentCMD?: AnyRecord;

    /**
     * @deprecated Provides access to a JSON mapping utility.
     */
    JsonMap?: typeof JsonMap;

    /**
     * Provides access to the Cassidy Express framework.
     */
    CassExpress?: typeof CassExpress;

    /**
     * @deprecated Provides access to custom AI utilities.
     */
    CustomAI?: typeof CustomAI;

    /**
     * @deprecated Provides access to the G4F framework.
     */
    g4f?: G4F;

    /**
     * @deprecated Manages flipcoin-related operations.
     */
    flipcoin?: {
      ranker: {
        getRank: (...args: any[]) => any;
        romanize: (...args: any[]) => any;
      };
      luck: {
        isLucky(uid: string): Promise<boolean>;
        getLuckStat(uid: string): Promise<number>;
        setLuckStat(uid: string, luckStat: number): Promise<number>;
        addLuckStat(
          uid: string,
          luckStat2: number | "random",
          range1?: number,
          range2?: number
        ): Promise<number | undefined>;
      };
    };

    /**
     * @deprecated Provides access to a censoring utility.
     */
    censor?: Function;

    /**
     * @deprecated Provides access to a generic box utility.
     */
    Box?: AnyConstructor;

    /**
     * @deprecated Provides access to the Liane utility.
     */
    Liane?: AnyRecord;

    /**
     * @deprecated Provides access to a generic box object.
     */
    box?: AnyRecord;

    /**
     * Provides access to the ElementalChild utility.
     */
    ElementalChild?: typeof ElementalChild;

    /**
     * Provides access to the elemental mapping utility.
     */
    elementalMapping?: typeof elementalMapping;

    /**
     * Provides access to the UNISym utility.
     */
    UNISym?: typeof UNISpectra;

    /**
     * Provides access to the options list utility.
     */
    OptionsList?: typeof OptionsList;

    /**
     * Provides access to the NeaxUI utility.
     */
    NeaxUI?: typeof NeaxUI;

    /**
     * Provides access to the VirtualFiles utility.
     */
    VirtualFiles?: typeof VirtualFiles;

    /**
     * Represents an instance of the NeaxUI utility.
     */
    neaxUI?: NeaxUI;

    /**
     * Provides access to the PetPlayer utility.
     */
    PetPlayer?: typeof PetPlayer;

    /**
     * Provides access to the GearsManage utility.
     */
    GearsManage?: typeof GearsManage;

    /**
     * Provides access to the GearData utility.
     */
    GearData?: typeof GearData;

    /**
     * Provides access to the WildPlayer utility.
     */
    WildPlayer?: typeof WildPlayer;

    /**
     * Provides access to the ElementalChilds utility.
     */
    ElementalChilds?: typeof ElementalChilds;

    /**
     * Provides access to the elementalPets utility.
     */
    elementalPets?: typeof elementalPets;

    /**
     * Retrieves the current inflation rate.
     */
    getInflationRate?: (
      usersData?: Record<string, UserData>
    ) => Promise<number>;

    /**
     * Selects a random item based on probabilities.
     */
    randomWithProb?: (teasures: Cass.InventoryItem[]) => Cass.InventoryItem;

    /**
     * Generates a gift item.
     */
    generateGift?: typeof generateGift;

    /**
     * Generates a cheque gift item.
     */
    generateChequeGift?: typeof generateChequeGift;

    /**
     * Generates an older trash item.
     */
    generateTrashOld?: typeof generateTrashOld;

    /**
     * Generates a trash item.
     */
    generateTrash?: typeof generateTrash;

    /**
     * Generates a treasure item based on a key.
     */
    generateTreasure?: (treasureKey: string) => Cass.InventoryItem;

    /**
     * Provides access to the treasures utility.
     */
    treasures?: typeof treasureInv;

    /**
     * Maps pet player data to relevant utilities.
     */
    petPlayerMaps?: (data: any) => {
      gearsManage: GearsManage;
      petsData: Inventory;
      playersMap: Map<string, PetPlayer>;
    };

    /**
     * @deprecated Provides access to the UTShop utility.
     */
    UTShop?: typeof UTShop;

    /**
     * Provides access to the TagParser utility.
     */
    TagParser?: typeof TagParser;

    /**
     * Provides access to the Slicer utility.
     */
    Slicer?: typeof Slicer;

    /**
     * Provides access to the ArgsHelper utility.
     */
    ArgsHelper?: typeof ArgsHelper;

    /**
     * Provides access to the CommandProperty utility.
     */
    CommandProperty?: typeof CommandProperty;

    /**
     * @deprecated Provides access to the Attachment utility.
     */
    Attachment?: AnyConstructor;

    /**
     * @deprecated Provides access to the MessageEditor utility.
     */
    MessageEditor?: AnyConstructor;

    /**
     * @deprecated Provides access to the MsgEditor utility.
     */
    MsgEditor?: AnyConstructor;

    /**
     * @deprecated Provides access to the Editor utility.
     */
    Editor?: AnyConstructor;

    /**
     * @deprecated Provides access to the ItemPrompt utility.
     */
    ItemPrompt?: AnyConstructor;

    /**
     * @deprecated Checks if a specific time is available.
     */
    isTimeAvailable?: typeof isTimeAvailable;

    /**
     * @deprecated Provides access to the ItemLister utility.
     */
    ItemLister?: typeof ItemLister;

    /**
     * @deprecated Provides access to user-related utilities.
     */
    Users?: ReturnType<typeof createUsers>;

    /**
     * @deprecated Provides access to thread-related utilities.
     */
    Threads?: ReturnType<typeof createThreads>;

    /**
     * @deprecated Provides access to a requester utility.
     */
    requester?: Function;

    /**
     * @deprecated Provides access to the Shop utility.
     */
    Shop?: AnyRecord;

    /**
     * @deprecated Provides access to the CassidyIO utility.
     */
    CassidyIO?: typeof CassidyIO;

    /**
     * @deprecated Provides access to the AutoEdit utility.
     */
    AutoEdit?: AnyConstructor;

    /**
     * @deprecated Provides access to an instance of CassidyIO.
     */
    cassIO?: CassidyIO;

    /**
     * @deprecated Provides access to the startSteal utility.
     */
    startSteal?: Function;

    /**
     * Easy, duhhh?
     */
    EasyOutput: typeof EasyOutput;

    /**
     * Sends a reply to the current user.
     */
    reply: EasyOutput["reply"];

    /**
     * Sends a reply to the current user.
     */
    print: EasyOutput["print"];

    /**
     * Sends a non-reply to the current user.
     */
    send: EasyOutput["send"];

    /**
     * Sends an emoji reaction to the current user.
     */
    reaction: EasyOutput["reaction"];

    /**
     * Sends an attachment to the current user using link
     */
    attachment: EasyOutput["attachment"];

    /**
     * Edits the last message that is sent using print, reply, or send
     */
    edit: EasyOutput["edit"];

    /**
     * Unsends the last message that is sent using print, reply, or send
     */
    unsend: EasyOutput["unsend"];

    /**
     * Add reply listener for the last message that is sent using print, reply, or send
     */
    atReply: EasyOutput["atReply"];

    /**
     * Add reaction listener for the last message that is sent using print, reply, or send
     */
    atReaction: EasyOutput["atReaction"];

    /**
     * Returns a pause promise, (USE await)
     */
    pause: typeof utils.delay;

    /**
     * Current user's registered name.
     */
    userName: string;

    /**
     * Userdata cache for current user, contains name, money, inventory, etc
     */
    user: UserData;

    /**
     * The senderID on output.js
     */
    uid: string;

    /**
     * The threadID on output.js
     */
    tid: string;

    /**
     * Gets the money of a user in real time, default to current user if no uid specified
     */
    getMoney?: (uid?: string) => Promise<number>;

    /**
     * Sets the money of a user in real time, default to current user if no uid specified
     */
    setMoney?: (balance: number, uid?: string) => Promise<void>;

    /**
     * Multi commands.
     */
    multiCommands: CassidySpectra.GlobalCassidy["multiCommands"];

    /**
     * Array of commands in same name or alias
     */
    foundCommands: CassidySpectra.CassidyCommand[];

    defCommand: CassidySpectra.CassidyCommand | undefined;
    supposedCommand: CassidySpectra.CassidyCommand | undefined;

    message?: XaviaTypes.XaviaCommandContext["message"];
    balance?: XaviaTypes.XaviaCommandContext["balance"];
    assets?: XaviaTypes.XaviaCommandContext["assets"];
    xDB?: XaviaTypes.XaviaCommandContext["xDB"];

    extra: CommandMeta["extra"];

    /**
     * Apply fonts.
     */
    fonts: typeof FontSystem.fonts;
    FontSystem: typeof FontSystem;
  }

  type CommandContext = CommandContextOG & { [key: string]: unknown };

  type StrictCommandContext = CommandContextOG;

  type CommandEntryFunc = ((
    ctx: CommandContext,
    ...args: any[]
  ) => any | Promise<any>) & {
    hooklet?: (pass: symbol) => CommandEntry;
  };
  type CommandEntry = (CommandEntryFunc | Record<string, CommandEntryFunc>) & {
    hooklet?: (pass: symbol) => CommandEntry;
  };

  type UserData = Cass.UserData;

  var utils: typeof GlobalUtilsX;

  var loadSymbols: Map<string, symbol>;

  export namespace CassidySpectra {
    export interface CommandContext extends CommandContextOG {}
    export interface GlobalCassidy {
      /**
       * @deprecated
       */
      consoleDisplay: ConsoleArray;
      config: typeof import("./settings.json");
      uptime: number;
      plugins: Record<string, any>;
      /**
       * @deprecated
       * use multiCommands instead.
       */
      commands: Record<string, CassidySpectra.CassidyCommand>;
      invLimit: number;
      replies: Record<
        string,
        import("input-cassidy").RepliesObj<
          import("input-cassidy").StandardReplyArg
        >
      >;
      reacts: Record<
        string,
        import("input-cassidy").ReactObj<
          import("input-cassidy").StandardReactArg
        >
      >;
      presets: Map<string, CommandStyle>;
      loadCommand: typeof loadCommand;
      loadPlugins: typeof loadPlugins;
      loadAllCommands: typeof loadAllCommands;
      readonly logo: string;
      oldLogo: string;
      accessToken: string | null;
      readonly redux: boolean;
      readonly spectra: boolean;
      readonly highRoll: (typeof Number)["MAX_SAFE_INTEGER"];
      hostedFilenames: (undefined | TempFile)[];
      databases?: {
        usersDB: UserStatsManager;
        threadsDB: UserStatsManager;
        globalDB: UserStatsManager;
      };
      multiCommands: MultiMap<string, CassidyCommand>;
    }

    export type Output = OutputX;
    export type Input = InputClass;
    export type InventoryConstructor = typeof Inventory;
    export type CollectiblesConstructor = typeof Collectibles;

    export { _CassidyUser as CassidyUser };
    export { _CassidyUser as User };

    export interface CassidyCommand {
      meta: CommandMeta;
      config?: CommandMeta;
      entry: CommandEntry;
      onCall?: CommandEntry;
      ID?: number;
      fileName?: string;
      treasuresTable?: Cass.InventoryItem[];
      briefcaseUsage?: Record<string, BreifcaseUsagePlugin>;
      filePath?: string;
      /**
       * @deprecated
       */
      cooldown?: CommandHandler;
      /**
       * @deprecated
       */
      noWeb?: CommandHandler;
      /**
       * @deprecated
       */
      noPermission?: CommandHandler;
      /**
       * @deprecated
       */
      needPrefix?: CommandHandler;
      /**
       * @deprecated
       */
      banned?: CommandHandler;
      /**
       * @deprecated
       */
      shopLocked?: CommandHandler;
      /**
       * @deprecated
       */
      awaiting?: CommandHandler;
      langs?: Record<string, Record<string, string>>;
      langData?: Record<string, Record<string, string>>;
      indivMeta?: ConstructorParameters<
        typeof SpectralCMDHome
      >["0"]["entryInfo"];
      /**
       * @deprecated
       */
      middleware?: CommandMiddleware[];
      /**
       * @deprecated
       */
      loaders?: CommandLoader[];
      /**
       * @deprecated
       */
      onError?: ErrorHandler;
      /**
       * @deprecated
       */
      onCooldown?: CooldownHandler;
      /**
       * @deprecated
       */
      duringLoad?: DuringLoadHandler;
      /**
       * @deprecated
       */
      noPrefix?: CommandHandler;
      /**
       * @deprecated
       */
      modLower?: CommandHandler;
      /**
       * @deprecated
       */
      reply?: CommandHandler;
      style?: CommandStyle;
      event?: CommandHandler;
      pack?: Record<string, CassidyCommand>;
      default?: CassidyCommand;

      run?: CommandEntry;
      handleEvent?: CommandHandler;
      handleReply?: CommandHandler;
      [name: string]: any;
    }

    export interface CommandMeta {
      name: string;
      fbOnly?: boolean;
      description: string;
      usage?: string;
      role?: InputRoles;
      category: string;
      version: `${string}.${string}.${string}`;
      /**
       * @deprecated
       */
      permissions?: number[];
      author?: string;
      otherNames?: string[];
      /**
       * @deprecated
       */
      ext_plugins?: Record<string, string>;
      waitingTime?: number;
      /**
       * @deprecated
       */
      botAdmin?: boolean;
      dependencies?: Record<string, string>;
      /**
       * @deprecated
       */
      whiteList?: string[];
      noPrefix?: boolean | "both";
      /**
       * @deprecated
       */
      allowModerators?: boolean;
      icon?: string;
      requirement?: string;
      supported?: string;
      /**
       * @deprecated
       */
      args?: {
        degree: number;
        fallback: null | string;
        response: string | null;
        search: null | string;
        required: boolean;
      }[];
      noWeb?: boolean;
      /**
       * @deprecated
       */
      params?: any[];
      legacyMode?: boolean;
      // Xavia
      aliases?: string[];
      cooldown?: number;
      credits?: string;
      extra?: Record<ObjectKey, any>;

      [name: string]: any;
      cmdType?: CommandTypes;

      hasPermssion?: number;
      usePrefix?: boolean;
    }

    export type CommandTypes =
      | "cplx_g"
      | "arl_g"
      | "fb_utl"
      | "smpl_g"
      | "mdia_utl"
      | "etc_xcmd";

    export type FontTypes =
      | "bold"
      | "fancy"
      | "bold_italic"
      | "fancy_italic"
      | "redux"
      | "widespace"
      | "serif"
      | "handwriting"
      | "scriptbold"
      | "script"
      | "typewriter"
      | "none"
      | "moody"
      | "double_struck";

    export type LineStyle =
      | "hidden"
      | "whiteline"
      | "default"
      | "akhiro"
      | `${number}chars`;

    export type LineDecoration = "none" | "cross" | "text";

    export type KerningStyle = "none" | "1" | "2" | "3";

    export interface CommandStyleBase {
      title?: string | StylerItem;
      titleFont?: FontTypes;
      content?: StylerItem;
      contentFont?: FontTypes;
      preset?: string | string[];
      titleStyle?: Partial<StylerItem>;
      contentStyle?: Partial<StylerItem>;
      lineDeco?: "x" | "altar" | "none";
    }

    export type CommandStyle = CommandStyleBase & {
      [key: string]: StylerItem | string | string[];
    };

    export interface StylerItem {
      preset?: string | string[];
      content?: string | null;
      content_template?: (string | number)[] | Record<string, string | number>;
      text_font?: FontTypes;
      number_font?: FontTypes;
      text_trim?: boolean;
      text_kerning?: KerningStyle;
      text_prefix?: string;
      text_suffix?: string;
      new_line?: boolean;
      line_top?: LineStyle;
      line_bottom?: LineStyle;
      line_bottom_inside_x?: LineStyle;
      line_bottom_inside_altar?: LineStyle;
      line_bottom_inside_text?: string;
      line_bottom_inside_text_elegant?: string;
      line_replacer?: string;
      line_replace?: string;
    }

    export type CommandHandler = (
      context: CommandContext
    ) => Promise<any> | any;

    export type CommandMiddleware = (
      context: CommandContext,
      next: () => Promise<void>
    ) => Promise<void>;

    export type CommandLoader = (
      context: CommandContext
    ) => Promise<void> | void;

    export type ErrorHandler = (
      error: Error,
      context: CommandContext
    ) => Promise<void> | void;

    export type CooldownHandler = (
      context: CommandContext
    ) => Promise<void> | void;

    export type DuringLoadHandler = () => Promise<void> | void;

    export { CommandEntry };
  }

  export interface Output extends OutputX {}
  export interface Input extends InputClass {}
  export interface OutputResultC extends OutputResult {}

  interface FactoryConfig {
    title: string;
    key: string;
    init: {
      slot: number;
      proc: number;
    };
    upgrades: {
      slot: number;
      proc: number;
    };
    recipes: Recipe[];
  }

  interface Recipe {
    name: string;
    icon: string;
    levelRequirement: number;
    waitingTime: number;
    ingr: IngredientGroup[];
    result: any;
  }

  type IngredientGroup = Ingredient | Ingredient[];

  interface Ingredient {
    name: string;
    icon: string;
    amount: number;
    key: string;
  }

  var defineCommand: typeof CassDefine.defineCommand;
  var easyCMD: typeof CassDefine.easyCMD;
}

import * as CassDefine from "@cass/define";

declare global {
  var Cassidy: CassidySpectra.GlobalCassidy;
  var handleStat: UserStatsManager;

  var cassMongoManager: CassMongoManager | undefined;

  interface API extends FCALianeAPI {}

  type FCAMqttEvent = FCAMqtt.MqttMessage & {};
}

import type * as FileType from "file-type";

import type { UserStatsManager } from "cassidy-userData";
import { CassMongoManager } from "./handlers/database/cass-mongo";
import type { CassidyResponseStylerControl } from "@cassidy/styler";
import { SpectralCMDHome } from "@cassidy/spectral-home";
import { LangParser } from "@cass-modules/langparser";
import * as GoatFill from "@cassidy/polyfills/goatbot";
import { CassTypes } from "@cass-modules/type-validator";
import { createCallable } from "@cass-modules/callable-obj";
import { G4F } from "g4f";
import { UNISpectra } from "@cassidy/unispectra";
import {
  ElementalChild,
  ElementalChilds,
  elementalMapping,
  elementalPets,
  GearData,
  GearsManage,
  PetPlayer,
  WildPlayer,
} from "@cass-plugins/pet-fight";
import { CassidyIO, EasyOutput, OutputResult } from "@cass-plugins/output.js";
import { JsonMap } from "@cass-plugins/JsonMap.js";
import { CassExpress, CustomAI } from "@cass-plugins/cassexpress.js";
import { NeaxUI, OptionsList, VirtualFiles } from "@cass-plugins/neax-ui.js";
import {
  ArgsHelper,
  CommandProperty,
  isTimeAvailable,
  ItemLister,
  Slicer,
  TagParser,
} from "@cass-plugins/utils-liane.js";
import { TempFile } from "./handlers/page/sendMessage.js";
import InputClass, { InputRoles } from "@cass-modules/InputClass.js";
import { loadCommand } from "./handlers/loaders/loadCommand";
import { loadPlugins } from "./handlers/loaders/loadPlugins";
import { loadAllCommands } from "./Cassidy.js";
import { etcTagMappings } from "./handlers/definers/jsx-runtime";
import { FCALianeAPI, FCAMqtt } from "@cass-modules/fca-types";
import { Files } from "@cass-modules/File";
import { NeaxScript } from "@cass-modules/NeaxScript";
import type * as SmartSpectra from "@cass-modules/SmartSpectra";
import { ConsoleArray } from "@cass-modules/ConsoleArray";
import { MultiMap } from "@cass-modules/Multimap";
import { BreifcaseUsagePlugin } from "@cass-modules/BriefcaseAPI";
import { Datum as _Datum } from "@cass-modules/Datum";
import { IFCAU_API, IFCAU_ListenMessage } from "@xaviabot/fca-unofficial";
import * as XaviaTypes from "@cass-modules/XaviaSupport/XaviaTypes";
import getCUser from "@cass-modules/XaviaSupport/User";
import { ObjectKey } from "@cass-modules/unitypes";
import { FormatArgs } from "@cass-modules/format-with";
import { FontSystem } from "cassidy-styler";
import { createThreads, createUsers } from "@cass-plugins/botpack-utils";

// import { defineOutputJSX, defineUserStatsJSX, VNode } from "@cass/define";
declare global {
  var fileTypePromise: Promise<typeof FileType>;
  /**
   * Custom utility type to mark CassidySpectra-specific extensions
   * @internal
   */
  type WasCustom<T> = T & { readonly _cass_extends?: true };

  /** Falsy values as per JavaScript */
  type Falsy = false | null | undefined | "" | 0;

  interface Object {
    /**
     * Creates a deep clone of the object using JSON serialization.
     * @template T - The type of the object being cloned
     * @returns A deep clone of the original object
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    cloneByJSON<T>(this: T): T;

    /**
     * Returns a random key from the object.
     * @returns A random key from the object
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomKey<T extends Record<string, any>>(this: T): string;

    /**
     * Returns a random [key, value] entry from the object.
     * @returns A tuple containing a random key and its value
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomEntry<T extends Record<string, any>>(this: T): [string, T[keyof T]];

    /**
     * Returns a random value from the object.
     * @returns A random value from the object
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomValue<T extends Record<string, any>>(this: T): T[keyof T];

    /**
     * Converts the object to a JSON string using its toJSON method if available.
     * @returns A JSON string representation of the object
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    toJSONString(this: { toJSON(): any }): string;

    /**
     * Returns the typeof result for the object.
     * @returns The type of the object as a string
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    typeof(this: unknown): string;

    /**
     * Removes falsy values from the object in-place.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    removeFalsy<T extends Record<string, any>>(this: T): void;

    /**
     * Iterates over each key-value pair in the object.
     * @template T - The type of the object
     * @param callback - Function to execute for each key-value pair
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    forEachKey<T extends Record<string, any>>(
      this: T,
      callback: (key: string, value: T[keyof T]) => void
    ): void;

    /**
     * Asynchronously maps over the object's values.
     * @template T - The type of the object's values
     * @template U - The type of the mapped values
     * @param callback - Async function to transform each value
     * @returns A promise resolving to a new object with transformed values
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    mapAsync<T, U>(
      this: Record<string, T>,
      callback: (value: T, key: string) => Promise<U>
    ): Promise<Record<string, U>>;

    /**
     * Maps over the object's values synchronously.
     * @template T - The type of the object's values
     * @template U - The type of the mapped values
     * @param callback - Function to transform each value
     * @returns A new object with transformed values
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    map<T, U>(
      this: Record<string, T>,
      callback: (value: T, key: string) => U
    ): Record<string, U>;
  }

  interface Array<T> {
    /**
     * Returns a random value from the array.
     * @returns A random element from the array
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomValue(this: T[]): T;

    /**
     * Returns a random index from the array.
     * @returns A random index number
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    randomIndex(this: T[]): number;

    /**
     * Returns a new array with unique values.
     * @returns A new array containing only unique elements
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    toUnique(this: T[]): T[];

    /**
     * Returns a new array with falsy values removed.
     * @template U - The non-falsy type
     * @returns A new array containing only truthy elements
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    removeFalsy<U>(this: (U | Falsy)[]): U[];

    /**
     * Removes specified items from the array and returns the new array.
     * @param itemsToRemove - Items to remove from the array
     * @returns A new array with specified items removed
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    remove(this: T[], ...itemsToRemove: T[]): T[];
  }

  interface String {
    /**
     * Applies a font transformation to the string.
     * @param font - The font to apply
     * @returns The transformed string
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    toFonted(this: string, font: string): string;

    /**
     * Converts the string to title case.
     * @returns The string in title case
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    toTitleCase(this: string): string;

    /**
     * Maps over each character in the string.
     * @template U - The type of the mapped values
     * @param callback - Function to transform each character
     * @returns An array of transformed values
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    map<U>(
      this: string,
      callback: (char: string, index: number, array: string[]) => U
    ): U[];

    /**
     * Formats the string by replacing numbered placeholders (%1, %2, etc.) with corresponding values.
     * Placeholders are 1-based and must exactly match the position of the replacer.
     * Unmatched placeholders remain unchanged. Replacers can be strings or functions.
     * @param replacers - The values or functions to replace placeholders with (%1 uses first replacer, %2 uses second, etc.)
     * @returns The formatted string with placeholders replaced where applicable
     * @example
     * "Hello %1, welcome to %2!".formatWith("John", "Earth") // Returns "Hello John, welcome to Earth!"
     * "test%1 and %2test".formatWith(n => n * 2, "b") // Returns "test2 and btest"
     * "Test %123 %12 %1".formatWith("a", "b", "c") // Returns "Test %123 %12 a"
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning May cause side effects outside CassidySpectra; avoid in other codebases
     * @reusable Safe within CassidySpectra projects
     */
    formatWith(...replacers: FormatArgs[]): string;
  }

  interface Function {
    /**
     * Converts a class constructor or regular function into a callable wrapper.
     * If the function has a prototype, it instantiates with `new`; otherwise, it invokes normally.
     * @returns A function that can be called with arguments like a factory.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    toCallable<T extends new (...args: any[]) => any>(
      this: T
    ): (...args: ConstructorParameters<T>) => InstanceType<T>;

    /**
     * Converts a class constructor or regular function into a callable wrapper.
     * If the function has a prototype, it instantiates with `new`; otherwise, it invokes normally.
     * @returns A function that can be called with arguments like a factory.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    toCallable<T extends (...args: any[]) => any>(
      this: T
    ): (...args: Parameters<T>) => ReturnType<T>;

    /**
     * Caches results of deep-argument function calls using `JSON.stringify` as key.
     * Handles complex arguments including nested objects and functions (serialized by `.toString()`).
     * @returns A memoized version of the function.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning Be cautious of large/deep structures and functions with side effects.
     * @reusable Safe within CassidySpectra projects
     */
    memoizeDeep<T extends (...args: any[]) => any>(this: T): T;

    /**
     * Chains the current function’s output into the next function’s input.
     * Equivalent to `nextFn(fn(...args))`.
     * @param nextFn - A function that takes the output of the current function.
     * @returns A chained function composition.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    chain<T extends (...args: any[]) => any, U>(
      this: T,
      nextFn: (result: ReturnType<T>) => U
    ): (...args: Parameters<T>) => U;

    /**
     * Logs the duration of the function execution to the console in milliseconds.
     * Useful for profiling or performance tuning.
     * @returns A timed version of the function.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    time<T extends (...args: any[]) => any>(this: T): T;

    /**
     * Defers the function execution until the next microtask using `Promise.resolve().then()`.
     * Useful for event loop control or async sequencing.
     * @returns A deferred asynchronous version of the function.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    defer<T extends (...args: any[]) => any>(
      this: T
    ): (...args: Parameters<T>) => Promise<ReturnType<T>>;

    /**
     * Validates the arguments passed into the function using a schema validator.
     * The schema must be compatible with `CassTypes.Validator`.
     * @param config - Schema configuration for validation.
     * @returns A guarded function that throws if inputs do not match schema.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning This assumes global `CassTypes.Validator` is defined and behaves like `zod` or `yup`.
     * @reusable Safe within CassidySpectra projects
     */
    guard<T extends (...args: any[]) => any>(
      this: T,
      config: CassTypes.TypeSchema
    ): T;

    /**
     * Injects a side-effect hook into the function call lifecycle.
     * Useful for debugging, logging, or analytics without modifying the logic.
     * @param callback - Receives the call `args`, `result`, and original `fn`.
     * @returns The function wrapped with an observer hook.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    observe<T extends (...args: any[]) => any | Function>(
      this: T,
      callback: (info: {
        args: Parameters<T>;
        result: ReturnType<T>;
        fn: T;
      }) => void
    ): T;
  }

  interface Function {
    /**
     * Retries the function if it throws, up to a maximum number of attempts.
     * Useful for transient failures like network requests or flaky operations.
     * @param attempts - Number of retries before giving up
     * @returns A function that automatically retries on failure
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    retry<T extends (...args: any[]) => any>(
      this: T,
      attempts: number
    ): (...args: Parameters<T>) => ReturnType<T>;

    /**
     * Limits function execution to no more than once per `ms` milliseconds.
     * Ignores any extra calls during the cooldown period.
     * @param ms - The time window in milliseconds
     * @returns A throttled version of the function
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    throttle<T extends (...args: any[]) => any>(
      this: T,
      ms: number
    ): (...args: Parameters<T>) => void;

    /**
     * Delays execution of the function until `ms` milliseconds after the last call.
     * Useful for input handling, search boxes, etc.
     * @param ms - Delay duration in milliseconds
     * @returns A debounced version of the function
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    debounce<T extends (...args: any[]) => any>(
      this: T,
      ms: number
    ): (...args: Parameters<T>) => void;

    /**
     * Executes a side-effect function with the same arguments, then proceeds with original execution.
     * Great for debugging, telemetry, or instrumentation.
     * @param callback - Receives the arguments for side-effect
     * @returns The original function with side-effect injection
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    tap<T extends (...args: any[]) => any>(
      this: T,
      callback: (...args: Parameters<T>) => void
    ): T;

    /**
     * Delays the function call by a specified time.
     * Works similarly to `setTimeout` but preserves context and args.
     * @param delay - Time to wait before execution
     * @param unit - Time unit: 'ms', 's', or 'm'
     * @returns A version of the function that executes after the delay
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning Timing is approximate; uses `setTimeout` under the hood
     * @reusable Safe within CassidySpectra projects
     */
    after<T extends (...args: any[]) => any>(
      this: T,
      delay: number,
      unit?: "ms" | "s" | "m"
    ): (...args: Parameters<T>) => Promise<ReturnType<T>>;

    /**
     * Assigns a static.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @warning Timing is approximate; uses `setTimeout` under the hood
     * @reusable Safe within CassidySpectra projects
     */
    assignStatic<
      T extends (...args: any[]) => any,
      M extends Record<string, any>
    >(
      methods: M
    ): ReturnType<typeof createCallable<T, M>>;

    /**
     * Wraps the function with a callback that intercepts its execution.
     * The callback receives the original function and its arguments.
     * @param callback - A function that takes the original function and its arguments.
     * @returns A wrapped version of the function.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    wrap<T extends (...args: any[]) => any, R>(
      this: T,
      callback: (fn: T, ...args: Parameters<T>) => R
    ): (...args: Parameters<T>) => R;

    /**
     * Invokes the function multiple times, passing the current index as an argument.
     * @param count - The number of times to invoke the function.
     * @returns An array of results from each invocation.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    invokeMultiple<T extends (...args: any[]) => any>(
      this: T,
      count: number,
      ...args: Parameters<T>
    ): ReturnType<T>[];

    /**
     * Invokes the function multiple times, passing the current index as an argument.
     * Returns an array of objects containing the result or error for each invocation.
     * @param count - The number of times to invoke the function.
     * @returns An array of objects with `returned` and `error` properties.
     * @custom CassidySpectra - Exclusive to CassidySpectra projects
     * @reusable Safe within CassidySpectra projects
     */
    invokeMultipleSettled<T extends (...args: any[]) => any>(
      this: T,
      count: number,
      ...args: Parameters<T>
    ): { returned: ReturnType<T>; error: unknown }[];
  }

  export interface OutputJSX {
    reply?: boolean;
    send?: boolean;
    reaction?: boolean;
    form?: StrictOutputForm;
  }

  export interface UserStatsJSX {
    key: keyof UserData;
  }

  export type FirstArg<T> = T extends (arg1: infer A, ...args: any[]) => any
    ? A
    : never;
  type ETCTags = typeof etcTagMappings;

  export namespace JSX {
    type Element = string;
    type ElementFragment = string;

    type IntrinsicElements = {
      [K in CassidySpectra.FontTypes as `f_${K}`]: {
        children?: JSX.Element | JSX.Element[] | string;
        [key: string]: any;
      };
    } & {
      [K in keyof ETCTags]: {
        children?: JSX.Element | JSX.Element[] | string;
        font?: CassidySpectra.FontTypes;
        [key: string]: any;
      };
    };
  }

  var GoatBot: typeof GoatFill.GoatBot;
  var client: typeof GoatFill.client;
  var db: typeof GoatFill.db;

  export namespace Express {
    interface Request {
      trueIP: string;
    }
  }

  export interface Math {
    /**
     * @see {@link Math.random}
     */
    randomOriginal: Math["random"];
  }

  var requireEsm: (url: string) => Promise<any>;
  var originalRequire: NodeRequire;
  var requireProc: (m: string) => any;

  export namespace NodeJS {
    interface Require {
      url?: (url: string) => Promise<any>;
      ensure?: (id: string) => any;
    }
  }
}

export default {};
