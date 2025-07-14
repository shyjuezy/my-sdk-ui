export declare const PROVIDER_CONFIGS: {
    readonly socure: {
        readonly name: "socure";
        readonly displayName: "Socure";
        readonly scriptUrl: "https://websdk.socure.com/bundle.js";
        readonly globalVariableName: "SocureDocVSDK";
        readonly supportedFeatures: readonly ["document_verification", "liveness_check", "face_match", "address_verification", "database_check", "qr_code_handoff"];
    };
    readonly incode: {
        readonly name: "incode";
        readonly displayName: "Incode";
        readonly scriptUrl: "https://sdk.incode.com/web/latest/incode.min.js";
        readonly globalVariableName: "Incode";
        readonly supportedFeatures: readonly ["document_verification", "liveness_check", "face_match", "video_verification"];
    };
    readonly jumio: {
        readonly name: "jumio";
        readonly displayName: "Jumio";
        readonly scriptUrl: "https://cdn.jumio.com/web/latest/jumio.min.js";
        readonly globalVariableName: "Jumio";
        readonly supportedFeatures: readonly ["document_verification", "liveness_check", "face_match", "address_verification"];
    };
    readonly onfido: {
        readonly name: "onfido";
        readonly displayName: "Onfido";
        readonly scriptUrl: "https://assets.onfido.com/onfido-sdk/latest/onfido.min.js";
        readonly stylesheetUrl: "https://assets.onfido.com/onfido-sdk/latest/style.css";
        readonly globalVariableName: "Onfido";
        readonly supportedFeatures: readonly ["document_verification", "liveness_check", "face_match", "video_verification"];
    };
    readonly veriff: {
        readonly name: "veriff";
        readonly displayName: "Veriff";
        readonly scriptUrl: "https://cdn.veriff.me/sdk/js/latest/veriff.min.js";
        readonly globalVariableName: "Veriff";
        readonly supportedFeatures: readonly ["document_verification", "liveness_check", "face_match", "video_verification"];
    };
};
export declare const PROVIDER_EVENTS: {
    readonly READY: "ready";
    readonly START: "start";
    readonly PROGRESS: "progress";
    readonly COMPLETE: "complete";
    readonly ERROR: "error";
    readonly CANCEL: "cancel";
    readonly CLOSE: "close";
    readonly DOCUMENT_FRONT_CAPTURE: "document:front:capture";
    readonly DOCUMENT_BACK_CAPTURE: "document:back:capture";
    readonly DOCUMENT_PROCESSING: "document:processing";
    readonly DOCUMENT_COMPLETE: "document:complete";
    readonly LIVENESS_START: "liveness:start";
    readonly LIVENESS_PROCESSING: "liveness:processing";
    readonly LIVENESS_COMPLETE: "liveness:complete";
    readonly FACE_MATCH_START: "face_match:start";
    readonly FACE_MATCH_PROCESSING: "face_match:processing";
    readonly FACE_MATCH_COMPLETE: "face_match:complete";
};
export declare const PROVIDER_ERROR_CODES: {
    readonly NETWORK_ERROR: "network_error";
    readonly TIMEOUT: "timeout";
    readonly INVALID_TOKEN: "invalid_token";
    readonly SESSION_EXPIRED: "session_expired";
    readonly UNSUPPORTED_BROWSER: "unsupported_browser";
    readonly PERMISSION_DENIED: "permission_denied";
    readonly DOCUMENT_NOT_READABLE: "document_not_readable";
    readonly DOCUMENT_EXPIRED: "document_expired";
    readonly DOCUMENT_NOT_SUPPORTED: "document_not_supported";
    readonly CAMERA_NOT_AVAILABLE: "camera_not_available";
    readonly CAMERA_PERMISSION_DENIED: "camera_permission_denied";
    readonly CAMERA_ERROR: "camera_error";
    readonly LIVENESS_FAILED: "liveness_failed";
    readonly FACE_NOT_DETECTED: "face_not_detected";
    readonly MULTIPLE_FACES: "multiple_faces";
};
//# sourceMappingURL=providers.d.ts.map