import type { PremiumSection } from '../types';

type DashboardHomeProps = {
    openBotBuilder: () => void;
    openSection: (section: PremiumSection) => void;
};

const DashboardHome = ({ openBotBuilder, openSection }: DashboardHomeProps) => (
    <section className='prodb-dashboard-home' aria-labelledby='dashboard-title'>
        <div className='prodb-page-heading'>
            <div>
                <p className='prodb-eyebrow'>Trading workspace</p>
                <h1 id='dashboard-title'>Build and run your strategy</h1>
                <p>Connect your Deriv account, test safely on demo, and manage automated trades from one workspace.</p>
            </div>
            <button className='prodb-primary-button' type='button' onClick={openBotBuilder}>Open Bot Builder</button>
        </div>
        <div className='prodb-dashboard-grid'>
            <button type='button' className='prodb-dashboard-card' onClick={() => openSection('quick_bot')}>
                <strong>Quick Bot</strong><span>Start with a ready-made strategy.</span>
            </button>
            <button type='button' className='prodb-dashboard-card' onClick={() => openSection('free_bots')}>
                <strong>Free Bots</strong><span>Browse strategies and load one into the builder.</span>
            </button>
            <button type='button' className='prodb-dashboard-card' onClick={() => openSection('manual_trading')}>
                <strong>Manual Trading</strong><span>Review markets and place trades manually.</span>
            </button>
        </div>
        <div className='prodb-dashboard-notice'>
            <strong>Start in demo mode</strong>
            <span>Trading involves risk. Verify your strategy before using real funds.</span>
        </div>
    </section>
);

export default DashboardHome;
