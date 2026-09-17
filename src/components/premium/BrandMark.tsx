import { useEffect } from 'react';
import lionLogo from '@/assets/images/lion_logo_1789599001445.jpg';
import { getTemplateDomain } from './domain-brand';
import './premium-template.scss';

const BrandMark = ({ dark = false }: { dark?: boolean }) => {
    const domain = getTemplateDomain();

    useEffect(() => {
        const apply = () => {
            document.title = `WELCOME TO ${domain}`;
            document.documentElement.style.setProperty('--template-domain', `"${domain}"`);
        };
        apply();
        const timer = window.setTimeout(apply, 0);
        return () => {
            window.clearTimeout(timer);
            document.documentElement.style.removeProperty('--template-domain');
        };
    }, [domain]);

    return (
        <div className={`prodb-brand ${dark ? 'prodb-brand--dark' : ''}`} aria-label={domain}>
            <div className='prodb-brand__symbol-lion'>
                <img src={lionLogo} alt="ELISY254 Lion Logo" className="prodb-lion-logo-img" />
            </div>
            <div className='prodb-brand__copy'>
                <strong>{domain}</strong>
                <small>OFFICIAL TRADING HUB</small>
            </div>
        </div>
    );
};

export default BrandMark;
