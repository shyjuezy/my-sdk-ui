'use strict';

var index = require('../index.js');

class BaseProvider {
    constructor() {
        this._isLoaded = false;
        this.sdkInstance = null;
        this.activeUI = null;
        this.eventEmitter = new index.EventEmitter();
        this.logger = new index.Logger('info', true);
    }
    get isLoaded() {
        return this._isLoaded;
    }
    mapEvent(event) {
        if (!event || typeof event !== 'object') {
            return null;
        }
        const evt = event;
        return {
            type: String(evt.type || 'unknown'),
            data: evt.data || evt,
            timestamp: new Date(),
        };
    }
    destroy() {
        if (this.activeUI) {
            this.activeUI.destroy();
            this.activeUI = null;
        }
        if (this.sdkInstance) {
            this.cleanupSDK();
            this.sdkInstance = null;
        }
        if (this.eventEmitter) {
            this.eventEmitter.removeAllListeners();
        }
        this._isLoaded = false;
        this.logger.info(`${this.name} provider destroyed`);
    }
    async loadScript(url, globalName) {
        return new Promise((resolve, reject) => {
            if (globalName && window[globalName]) {
                this.logger.info(`${this.name} SDK already loaded`);
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                this.logger.info(`${this.name} SDK loaded successfully`);
                resolve();
            };
            script.onerror = (error) => {
                this.logger.error(`Failed to load ${this.name} SDK`, error);
                reject(new index.VecuError('PROVIDER_SDK_LOAD_FAILED', `Failed to load ${this.name} SDK from ${url}`));
            };
            document.head.appendChild(script);
        });
    }
    createUIContainer(parentContainer, mode) {
        const container = document.createElement('div');
        container.className = `vecu-idv-${this.name}-container vecu-idv-${mode}`;
        container.setAttribute('data-provider', this.name);
        container.style.cssText = `
      position: ${mode === 'modal' ? 'fixed' : 'relative'};
      width: 100%;
      height: 100%;
      ${mode === 'modal' ? 'top: 0; left: 0; z-index: 9999;' : ''}
    `;
        parentContainer.appendChild(container);
        return container;
    }
    removeUIContainer(container) {
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }
    emitProviderEvent(type, data) {
        const event = {
            type,
            data,
            timestamp: new Date(),
        };
        this.eventEmitter.emit(type, event);
        this.eventEmitter.emit('provider:event', event);
    }
    handleProviderError(error, context) {
        const vecuError = error instanceof index.VecuError
            ? error
            : new index.VecuError('PROVIDER_ERROR', `${this.name} provider error in ${context}: ${error instanceof Error ? error.message : String(error)}`, this.name);
        this.logger.error(`${this.name} provider error`, vecuError);
        this.emitProviderEvent('provider:error', {
            code: vecuError.code,
            message: vecuError.message,
            provider: this.name,
            context,
        });
        throw vecuError;
    }
    on(event, handler) {
        this.eventEmitter.on(event, handler);
    }
    off(event, handler) {
        this.eventEmitter.off(event, handler);
    }
    validateInitOptions(options) {
        if (!options.sessionId) {
            throw new index.VecuError('INVALID_OPTIONS', 'Session ID is required');
        }
        if (!options.token) {
            throw new index.VecuError('INVALID_OPTIONS', 'Token is required');
        }
        if (!options.container || !(options.container instanceof HTMLElement)) {
            throw new index.VecuError('INVALID_OPTIONS', 'Valid HTML container element is required');
        }
        if (!['modal', 'embedded'].includes(options.mode)) {
            throw new index.VecuError('INVALID_OPTIONS', 'Mode must be either "modal" or "embedded"');
        }
    }
}

const PROVIDER_CONFIGS = {
    socure: {
        scriptUrl: 'https://websdk.socure.com/bundle.js',
        supportedFeatures: [
            'document_verification',
            'liveness_check',
            'face_match',
            'address_verification',
            'database_check',
            'qr_code_handoff',
        ],
    }};
const PROVIDER_EVENTS = {
    READY: 'ready',
    START: 'start',
    COMPLETE: 'complete',
    ERROR: 'error',
    CLOSE: 'close',
    DOCUMENT_FRONT_CAPTURE: 'document:front:capture',
    DOCUMENT_BACK_CAPTURE: 'document:back:capture',
    DOCUMENT_PROCESSING: 'document:processing',
    LIVENESS_START: 'liveness:start',
    LIVENESS_PROCESSING: 'liveness:processing',
    LIVENESS_COMPLETE: 'liveness:complete'};

function createElement(tagName, attributes, children) {
    const element = document.createElement(tagName);
    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            }
            else if (key === 'style') {
                element.setAttribute('style', value);
            }
            else if (key.startsWith('data-')) {
                element.setAttribute(key, value);
            }
            else {
                element[key] = value;
            }
        });
    }
    return element;
}
function loadScript(src, attributes) {
    return new Promise((resolve, reject) => {
        const script = createElement('script', {
            src,
            async: 'true',
            ...attributes,
        });
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

class SocureSDKLoader {
    constructor() {
        this.loadPromise = null;
        this.sdkInstance = null;
        this.isDestroyed = false;
    }
    static getInstance() {
        if (!SocureSDKLoader.instance) {
            SocureSDKLoader.instance = new SocureSDKLoader();
        }
        return SocureSDKLoader.instance;
    }
    async load() {
        if (this.isDestroyed || (!this.sdkInstance && window.SocureDocVSDK)) {
            console.log('SocureSDKLoader: SDK was destroyed or in bad state, forcing reload');
            this.isDestroyed = false;
            this.sdkInstance = null;
            this.loadPromise = null;
            delete window.SocureDocVSDK;
        }
        if (this.sdkInstance) {
            return this.sdkInstance;
        }
        if (this.loadPromise) {
            return this.loadPromise;
        }
        this.loadPromise = this.loadSDK();
        try {
            this.sdkInstance = await this.loadPromise;
            return this.sdkInstance;
        }
        catch (error) {
            this.loadPromise = null;
            throw error;
        }
    }
    async loadSDK() {
        const config = PROVIDER_CONFIGS.socure;
        const globalName = 'SocureDocVSDK';
        if (window[globalName]) {
            return window[globalName];
        }
        const timeoutMs = 30000;
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new index.TimeoutError(`Socure SDK load timeout after ${timeoutMs}ms`, timeoutMs));
            }, timeoutMs);
        });
        const scriptUrl = this.isDestroyed
            ? `${config.scriptUrl}?t=${Date.now()}`
            : config.scriptUrl;
        const loadPromise = loadScript(scriptUrl, {
            'data-provider': 'socure',
            crossorigin: 'anonymous',
        }).then(() => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const sdk = window[globalName];
                    if (!sdk) {
                        reject(new Error(`Socure DocV SDK not found at window.${globalName}`));
                    }
                    else {
                        resolve(sdk);
                    }
                }, 100);
            });
        });
        return Promise.race([loadPromise, timeoutPromise]);
    }
    isLoaded() {
        return this.sdkInstance !== null;
    }
    getSDK() {
        return this.sdkInstance;
    }
    destroy() {
        this.isDestroyed = true;
        if (window.SocureDocVSDK) {
            delete window.SocureDocVSDK;
        }
        const socureScripts = document.querySelectorAll('script[src*="websdk.socure.com"]');
        socureScripts.forEach(script => {
            script.remove();
        });
        this.sdkInstance = null;
        this.loadPromise = null;
        SocureSDKLoader.instance = null;
    }
}
SocureSDKLoader.instance = null;

class SocureEventMapper {
    static mapEvent(socureEvent) {
        if (!socureEvent || typeof socureEvent !== 'object') {
            return null;
        }
        const eventType = socureEvent.type;
        const mappedType = this.eventMap[eventType] || eventType;
        return {
            type: mappedType,
            data: this.mapEventData(eventType, socureEvent.data),
            timestamp: new Date(socureEvent.timestamp || Date.now()),
        };
    }
    static mapEventData(eventType, data) {
        switch (eventType) {
            case 'complete':
                return this.mapCompleteData(data);
            case 'error':
                return this.mapErrorData(data);
            case 'document_front_capture':
            case 'document_back_capture':
                return this.mapDocumentCaptureData(data);
            case 'liveness_complete':
                return this.mapLivenessData(data);
            case 'qr_code_displayed':
                return this.mapQRCodeData(data);
            default:
                return data;
        }
    }
    static mapCompleteData(data) {
        if (!data)
            return {};
        return {
            sessionId: data.referenceId,
            status: 'completed',
            documentData: data.documentData ? {
                type: data.documentData.type,
                number: data.documentData.documentNumber,
                issuingCountry: data.documentData.issuingCountry,
                expirationDate: data.documentData.expirationDate,
                firstName: data.documentData.firstName,
                lastName: data.documentData.lastName,
                dateOfBirth: data.documentData.dateOfBirth,
                address: data.documentData.address,
            } : undefined,
            livenessData: data.livenessData ? {
                passed: data.livenessData.passed,
                score: data.livenessData.score,
                confidence: data.livenessData.confidence,
            } : undefined,
            fraudSignals: data.fraud ? {
                overallRisk: this.mapRiskLevel(data.fraud.score),
                signals: data.fraud.signals.map((signal) => ({
                    type: signal.name,
                    risk: signal.risk,
                    description: signal.description,
                })),
            } : undefined,
        };
    }
    static mapErrorData(data) {
        if (!data)
            return { code: 'UNKNOWN_ERROR', message: 'Unknown error occurred' };
        return {
            code: data.code || 'SOCURE_ERROR',
            message: data.message || 'Socure verification error',
            details: data.details,
            provider: 'socure',
        };
    }
    static mapDocumentCaptureData(data) {
        return {
            side: data?.side || 'unknown',
            quality: data?.quality || 'unknown',
            timestamp: new Date().toISOString(),
        };
    }
    static mapLivenessData(data) {
        return {
            passed: data?.passed || false,
            score: data?.score || 0,
            confidence: data?.confidence || 'low',
            timestamp: new Date().toISOString(),
        };
    }
    static mapQRCodeData(data) {
        return {
            qrCodeUrl: data?.url,
            sessionUrl: data?.sessionUrl,
            expiresAt: data?.expiresAt,
        };
    }
    static mapRiskLevel(score) {
        if (score < 30)
            return 'low';
        if (score < 70)
            return 'medium';
        return 'high';
    }
    static mapWebhookData(webhookData) {
        if (!webhookData)
            return null;
        const decision = webhookData.documentVerification?.decision ||
            webhookData.selfieVerification?.decision ||
            'review';
        return {
            sessionId: webhookData.referenceId,
            provider: 'socure',
            status: webhookData.status === 'complete' ? 'completed' : 'failed',
            decision: this.mapDecision(decision),
            documentData: webhookData.documentVerification ? {
                type: webhookData.documentVerification.documentType,
                ...webhookData.documentVerification.documentFields,
            } : undefined,
            livenessData: webhookData.selfieVerification ? {
                passed: webhookData.selfieVerification.decision === 'accept',
                score: webhookData.selfieVerification.livenessScore,
                confidence: this.mapConfidence(webhookData.selfieVerification.livenessScore),
            } : undefined,
            fraudSignals: webhookData.fraud ? {
                overallRisk: this.mapRiskLevel(webhookData.fraud.score),
                signals: webhookData.fraud.signals.map((signal) => ({
                    type: signal,
                    risk: 'medium',
                    description: signal,
                })),
            } : undefined,
            completedAt: new Date(webhookData.updatedAt),
        };
    }
    static mapDecision(decision) {
        switch (decision) {
            case 'accept':
                return 'approved';
            case 'reject':
                return 'declined';
            default:
                return 'review';
        }
    }
    static mapConfidence(score) {
        if (score >= 80)
            return 'high';
        if (score >= 50)
            return 'medium';
        return 'low';
    }
}
SocureEventMapper.eventMap = {
    init: PROVIDER_EVENTS.READY,
    ready: PROVIDER_EVENTS.READY,
    start: PROVIDER_EVENTS.START,
    document_front_capture: PROVIDER_EVENTS.DOCUMENT_FRONT_CAPTURE,
    document_back_capture: PROVIDER_EVENTS.DOCUMENT_BACK_CAPTURE,
    document_processing: PROVIDER_EVENTS.DOCUMENT_PROCESSING,
    liveness_start: PROVIDER_EVENTS.LIVENESS_START,
    liveness_processing: PROVIDER_EVENTS.LIVENESS_PROCESSING,
    liveness_complete: PROVIDER_EVENTS.LIVENESS_COMPLETE,
    complete: PROVIDER_EVENTS.COMPLETE,
    error: PROVIDER_EVENTS.ERROR,
    close: PROVIDER_EVENTS.CLOSE,
    qr_code_displayed: 'qr_code:displayed',
    mobile_handoff: 'mobile:handoff',
};

class SocureProvider extends BaseProvider {
    getCompletionMessage(response) {
        if (response.mobileNumber) {
            return 'Verification complete! Check your SMS for further instructions.';
        }
        if (response.customerUserId) {
            return 'Verification complete! Please check your email for further instructions.';
        }
        return 'Verification completed successfully! You may now proceed.';
    }
    constructor() {
        super();
        this.name = 'socure';
        this.version = '1.0.0';
        this.supportedFeatures = [...PROVIDER_CONFIGS.socure.supportedFeatures];
        this.socureDocVSDK = null;
        this.activeSession = null;
        this.sdkLoader = SocureSDKLoader.getInstance();
    }
    async loadSDK() {
        try {
            this.logger.info('Loading Socure DocV SDK...');
            if (!this.sdkLoader) {
                this.sdkLoader = SocureSDKLoader.getInstance();
            }
            this.socureDocVSDK = await this.sdkLoader.load();
            this._isLoaded = true;
            this.logger.info('Socure DocV SDK loaded successfully');
            this.emitProviderEvent('provider:loaded', { provider: this.name });
        }
        catch (error) {
            this._isLoaded = false;
            this.handleProviderError(error, 'loadSDK');
        }
    }
    async initializeVerification(options) {
        try {
            this.validateInitOptions(options);
            if (window.SocureDocVSDK || document.querySelector('iframe[src*="socure"]')) {
                this.logger.info('Detected existing Socure state, cleaning up before initialization...');
                if (options.container instanceof HTMLElement) {
                    while (options.container.firstChild) {
                        options.container.removeChild(options.container.firstChild);
                    }
                }
                document.querySelectorAll('iframe[src*="socure"], iframe[id*="socure"]').forEach(el => {
                    el.remove();
                });
                const socureGlobals = ['SocureDocVSDK', 'Socure', 'socure', 'SOCURE'];
                socureGlobals.forEach(globalName => {
                    if (window[globalName]) {
                        delete window[globalName];
                    }
                });
                document.querySelectorAll('script[src*="websdk.socure.com"]').forEach(script => {
                    script.remove();
                });
                this._isLoaded = false;
                this.socureDocVSDK = null;
                if (this.sdkLoader) {
                    this.sdkLoader.destroy();
                    this.sdkLoader = SocureSDKLoader.getInstance();
                }
                await new Promise(resolve => setTimeout(resolve, 300));
                await this.loadSDK();
            }
            if (!this.socureDocVSDK) {
                throw new index.ProviderError(this.name, 'Socure DocV SDK not loaded');
            }
            this.logger.info('Initializing Socure verification', {
                sessionId: options.sessionId,
                hasSDK: !!this.socureDocVSDK,
                sdkType: typeof this.socureDocVSDK,
                methods: this.socureDocVSDK ? Object.keys(this.socureDocVSDK) : []
            });
            console.log('[SOCURE DEBUG] SDK Object:', this.socureDocVSDK);
            const sdkKey = options.config?.publicKey || options.config?.sdkKey;
            if (!sdkKey) {
                throw new index.ProviderError(this.name, 'Socure SDK key is required in provider config');
            }
            console.log('[SOCURE DEBUG] SDK Key:', sdkKey.substring(0, 10) + '...');
            const docvTransactionToken = options.token;
            if (!docvTransactionToken) {
                throw new index.ProviderError(this.name, 'docvTransactionToken is required');
            }
            console.log('[SOCURE DEBUG] Token:', docvTransactionToken.substring(0, 10) + '...');
            const uiContainer = this.createUIContainer(options.container, options.mode);
            console.log('[SOCURE DEBUG] Container created:', {
                element: uiContainer,
                id: uiContainer.id,
                className: uiContainer.className,
                parentElement: uiContainer.parentElement?.tagName,
                isVisible: uiContainer.offsetWidth > 0 && uiContainer.offsetHeight > 0
            });
            const socureConfig = {
                onProgress: (event) => {
                    this.logger.info('Socure progress event', event);
                    console.log('[SOCURE DEBUG] Progress event:', event);
                    this.handleProgressEvent(event, options.sessionId);
                },
                onSuccess: (response) => {
                    this.logger.info('Socure verification completed', response);
                    console.log('[SOCURE DEBUG] Success response:', response);
                    console.log('[SOCURE DEBUG] Response keys:', Object.keys(response));
                    console.log('[SOCURE DEBUG] Response status:', response.status);
                    console.log('[SOCURE DEBUG] Has status property:', 'status' in response);
                    console.log('[SOCURE DEBUG] Status equals DOCUMENTS_UPLOADED:', response.status === 'DOCUMENTS_UPLOADED');
                    console.log('[SOCURE DEBUG] onSuccess fallback - DOCUMENTS_UPLOADED should be handled via progress events');
                    if (!('status' in response) || response.status !== 'DOCUMENTS_UPLOADED') {
                        console.log('[SOCURE DEBUG] Using fallback completion structure for non-DOCUMENTS_UPLOADED');
                        const mappedEvent = SocureEventMapper.mapEvent({
                            type: 'complete',
                            data: response,
                            timestamp: Date.now(),
                        });
                        if (mappedEvent) {
                            console.log('[SOCURE DEBUG] Emitting mapped event:', mappedEvent.type, mappedEvent.data);
                            this.emitProviderEvent(mappedEvent.type, mappedEvent.data);
                        }
                        const fallbackEventData = {
                            sessionId: options.sessionId,
                            message: 'Verification completed successfully! You may now proceed.',
                            result: response
                        };
                        console.log('[SOCURE DEBUG] Emitting fallback verification:completed event:', fallbackEventData);
                        this.emitProviderEvent('verification:completed', fallbackEventData);
                    }
                },
                onError: (error) => {
                    this.logger.error('Socure verification error', error);
                    console.log('[SOCURE DEBUG] Error response:', error);
                    if ('status' in error && (error.status === 'CONSENT_DECLINED' || error.status === 'DOCUMENTS_UPLOAD_FAILED')) {
                        const errorCode = error.status === 'CONSENT_DECLINED' ? 'USER_CANCELLED' : 'UPLOAD_FAILED';
                        this.emitProviderEvent('verification:failed', {
                            sessionId: options.sessionId,
                            error: {
                                code: errorCode,
                                message: error.status.replace(/_/g, ' ').toLowerCase(),
                                docvTransactionToken: error.docvTransactionToken
                            }
                        });
                        if (error.status === 'CONSENT_DECLINED') {
                            this.emitProviderEvent('ui:closed', { sessionId: options.sessionId });
                        }
                    }
                    else {
                        const mappedEvent = SocureEventMapper.mapEvent({
                            type: 'error',
                            data: error,
                            timestamp: Date.now(),
                        });
                        if (mappedEvent) {
                            this.emitProviderEvent(mappedEvent.type, mappedEvent.data);
                        }
                        if ('code' in error && error.code === 'USER_CANCELLED') {
                            this.emitProviderEvent('ui:closed', { sessionId: options.sessionId });
                        }
                    }
                },
                qrCodeNeeded: options.config?.qrCode || false,
            };
            const containerId = `socure-container-${Date.now()}`;
            uiContainer.id = containerId;
            const containerSelector = `#${containerId}`;
            console.log('[SOCURE DEBUG] Before launch:', {
                sdkKey: sdkKey.substring(0, 10) + '...',
                token: docvTransactionToken.substring(0, 10) + '...',
                selector: containerSelector,
                configKeys: Object.keys(socureConfig),
                containerInDOM: !!document.querySelector(containerSelector)
            });
            let session;
            try {
                session = this.socureDocVSDK.launch(sdkKey, docvTransactionToken, containerSelector, socureConfig);
                console.log('[SOCURE DEBUG] Launch returned:', session);
            }
            catch (launchError) {
                console.error('[SOCURE DEBUG] Launch error:', launchError);
                throw launchError;
            }
            if (session && typeof session === 'object') {
                this.activeSession = session;
                console.log('[SOCURE DEBUG] Session stored:', { hasDestroy: 'destroy' in session });
            }
            else {
                console.log('[SOCURE DEBUG] No session returned, creating mock session');
                this.activeSession = {
                    id: options.sessionId,
                    status: 'active',
                    destroy: () => {
                        this.logger.info('Destroying Socure session');
                    }
                };
            }
            setTimeout(() => {
                const containerEl = document.querySelector(containerSelector);
                console.log('[SOCURE DEBUG] After 500ms:', {
                    containerExists: !!containerEl,
                    hasChildren: containerEl ? containerEl.children.length : 0,
                    innerHTML: containerEl ? containerEl.innerHTML.substring(0, 100) : 'N/A'
                });
            }, 500);
            const verificationUI = {
                container: uiContainer,
                sessionId: options.sessionId,
                provider: this.name,
                destroy: () => {
                    this.destroySession();
                    this.removeUIContainer(uiContainer);
                },
            };
            this.activeUI = verificationUI;
            this.emitProviderEvent('ui:created', { sessionId: options.sessionId });
            setTimeout(() => {
                this.emitProviderEvent('ui:ready', { sessionId: options.sessionId });
            }, 100);
            return verificationUI;
        }
        catch (error) {
            this.handleProviderError(error, 'initializeVerification');
        }
    }
    processWebhookData(data) {
        try {
            const mappedData = SocureEventMapper.mapWebhookData(data);
            return {
                status: mappedData.status,
                decision: mappedData.decision,
                data: {
                    documentData: mappedData.documentData,
                    livenessData: mappedData.livenessData,
                    fraudSignals: mappedData.fraudSignals,
                },
                metadata: {
                    provider: this.name,
                    processedAt: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            this.logger.error('Failed to process webhook data', error);
            throw new index.ProviderError(this.name, 'Failed to process webhook data');
        }
    }
    mapEvent(event) {
        return SocureEventMapper.mapEvent(event);
    }
    cleanupSDK() {
        this.destroySession();
        const socureIframes = document.querySelectorAll('iframe[src*="socure"], iframe[id*="socure"]');
        socureIframes.forEach(iframe => {
            this.logger.info('Removing Socure iframe from DOM');
            iframe.remove();
        });
        const socureGlobals = ['SocureDocVSDK', 'Socure', 'socure', 'SOCURE'];
        socureGlobals.forEach(globalName => {
            if (window[globalName]) {
                this.logger.info(`Clearing global ${globalName}`);
                delete window[globalName];
            }
        });
        const socureContainers = document.querySelectorAll('[id*="socure-container"], .socure-sdk-container');
        socureContainers.forEach(container => {
            this.logger.info('Removing Socure container from DOM');
            container.remove();
        });
        this.sdkLoader.destroy();
        this.socureDocVSDK = null;
    }
    handleProgressEvent(event, sessionId) {
        if (event.status) {
            const statusMapping = {
                'WAITING_FOR_USER_TO_REDIRECT': 'qr_code_displayed',
                'WAITING_FOR_UPLOAD': 'verification:started',
                'DOCUMENTS_UPLOADED': 'verification:completed',
            };
            const mappedType = statusMapping[event.status] || 'verification:progress';
            if (event.status === 'DOCUMENTS_UPLOADED') {
                console.log('[SOCURE DEBUG] Processing DOCUMENTS_UPLOADED in handleProgressEvent');
                const completionMessage = this.getCompletionMessage(event);
                console.log('[SOCURE DEBUG] Generated completion message:', completionMessage);
                const eventData = {
                    sessionId,
                    message: completionMessage,
                    result: {
                        status: 'completed',
                        docvTransactionToken: event.docvTransactionToken,
                        deviceSessionToken: event.deviceSessionToken,
                        customerUserId: event.customerUserId
                    }
                };
                console.log('[SOCURE DEBUG] Emitting verification:completed from progress event:', eventData);
                this.emitProviderEvent('verification:completed', eventData);
            }
            else {
                this.emitProviderEvent(mappedType, {
                    sessionId,
                    status: event.status,
                    docvTransactionToken: event.docvTransactionToken,
                    customerUserId: event.customerUserId,
                    mobileNumber: event.mobileNumber
                });
                this.emitProviderEvent('verification:progress', {
                    sessionId,
                    step: event.status,
                    percentage: event.status === 'WAITING_FOR_USER_TO_REDIRECT' ? 10 : 30,
                    message: event.status.replace(/_/g, ' ').toLowerCase()
                });
            }
        }
        else {
            console.warn('[SOCURE DEBUG] Unexpected progress event structure:', event);
            this.logger.warn('Received unexpected progress event structure from Socure', event);
        }
    }
    destroySession() {
        if (this.activeSession) {
            try {
                this.activeSession.destroy();
            }
            catch (error) {
                this.logger.error('Error destroying Socure session', error);
            }
            this.activeSession = null;
        }
    }
}

exports.SocureProvider = SocureProvider;
//# sourceMappingURL=SocureProvider-BlZjcW9f.js.map
