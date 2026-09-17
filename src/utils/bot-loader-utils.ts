import { load, save_types } from '@/external/bot-skeleton';
import { DBOT_TABS } from '@/constants/bot-contents';

export const waitForWorkspace = async (maxAttempts = 80, delayMs = 100): Promise<any> => {
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const workspace = window.Blockly?.derivWorkspace;
        if (workspace && workspace.rendered !== false) {
            return workspace;
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    const fallback = window.Blockly?.derivWorkspace;
    if (fallback) return fallback;
    throw new Error('Bot Builder workspace is not ready. Please try again.');
};

export const loadStrategyToBotBuilder = async (
    xmlContent: string,
    fileName: string,
    openBotBuilder?: () => void
): Promise<void> => {
    if (!xmlContent || !xmlContent.trim()) {
        throw new Error('Provided strategy XML is empty.');
    }

    // 1. Switch active section to Bot Builder tab
    if (openBotBuilder) {
        openBotBuilder();
    }

    // 2. Ensure MobX DBotStore active tab is set to BOT_BUILDER
    if (window.DBotStore?.instance?.dashboard) {
        window.DBotStore.instance.dashboard.setActiveTab(DBOT_TABS.BOT_BUILDER);
    }

    // 3. Wait until Blockly workspace element is mounted and rendered in DOM
    const workspace = await waitForWorkspace();

    // 4. Ensure clean filename
    const cleanFileName = fileName.endsWith('.xml') ? fileName : `${fileName}.xml`;

    // 5. Load strategy XML into Blockly workspace
    await load({
        block_string: xmlContent,
        file_name: cleanFileName,
        workspace,
        from: save_types.LOCAL,
        drop_event: {},
        strategy_id: null,
        showIncompatibleStrategyDialog: false,
        show_snackbar: true,
    });

    // 6. Update bot name in save modal store
    if (window.DBotStore?.instance?.save_modal) {
        window.DBotStore.instance.save_modal.updateBotName(cleanFileName);
    }

    // 7. Render & resize workspace canvas so blocks are immediately visible and aligned
    await new Promise(resolve => setTimeout(resolve, 80));
    try {
        if (window.Blockly?.svgResize && workspace) {
            window.Blockly.svgResize(workspace);
        }
        if (workspace && typeof workspace.cleanUp === 'function') {
            workspace.cleanUp();
        }
        window.dispatchEvent(new Event('resize'));
    } catch {
        // UI render safeguard
    }
};
