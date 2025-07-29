// Privacy Policy Analyzer - Built-in Analyzer Module
// Pattern-based privacy policy analysis

import { Utils } from './utils.js';

export class BuiltInAnalyzer {
    static analyze(textContent) {
        const issues = this.detectCommonIssues(textContent);
        return {
            issues,
            summary: `Analyzed ${textContent.length} characters. Found ${issues.length} potential concerns.`,
            recommendations: this.generateRecommendations(issues)
        };
    }

    static detectCommonIssues(text) {
        const issues = [];
        const patterns = [
            {
                id: 'data_sharing_third_party',
                pattern: /(share|sell|transfer|provide).{0,50}(personal|data|information).{0,50}(third.party|partner|affiliate|vendor)/gi,
                severity: 'high',
                category: 'Data Sharing',
                title: 'Third-Party Data Sharing',
                description: 'Your data may be shared with third parties',
                legalSuggestion: 'Review what specific data is shared and with whom. Consider if this is necessary for the service.'
            },
            {
                id: 'data_retention_long',
                pattern: /(retain|keep|store).{0,30}(indefinitely|permanently|forever|long.term)/gi,
                severity: 'high',
                category: 'Data Retention',
                title: 'Indefinite Data Retention',
                description: 'Data may be kept indefinitely',
                legalSuggestion: 'Request specific retention periods. Data should only be kept as long as necessary.'
            },
            {
                id: 'tracking_extensive',
                pattern: /(track|monitor|collect).{0,50}(behavior|activity|browsing|location)/gi,
                severity: 'medium',
                category: 'Tracking',
                title: 'Extensive Tracking',
                description: 'Comprehensive tracking of your activities',
                legalSuggestion: 'Understand what tracking is essential vs. optional. Look for opt-out options.'
            },
            {
                id: 'policy_changes_unilateral',
                pattern: /(change|modify|update).{0,30}(policy|terms).{0,50}(notice|notification|discretion)/gi,
                severity: 'medium',
                category: 'Policy Changes',
                title: 'Unilateral Policy Changes',
                description: 'Policy can be changed without your consent',
                legalSuggestion: 'Look for guarantees of notice before changes and your right to object.'
            },
            {
                id: 'data_security_vague',
                pattern: /(security|protect).{0,30}(reasonable|appropriate|industry.standard)/gi,
                severity: 'medium',
                category: 'Security',
                title: 'Vague Security Measures',
                description: 'Security measures are not clearly defined',
                legalSuggestion: 'Request specific information about encryption and security standards used.'
            },
            {
                id: 'user_rights_limited',
                pattern: /(delete|access|control|portability).{0,50}(limited|restricted|may.not|cannot)/gi,
                severity: 'high',
                category: 'User Rights',
                title: 'Limited User Rights',
                description: 'Your rights to control your data are restricted',
                legalSuggestion: 'Verify this complies with local privacy laws (GDPR, CCPA, etc.)'
            }
        ];

        patterns.forEach(pattern => {
            const matches = text.match(pattern.pattern);
            if (matches) {
                matches.forEach(match => {
                    const startIndex = text.indexOf(match);
                    const context = Utils.extractContext(text, startIndex, match.length);
                    issues.push({
                        ...pattern,
                        matchedText: match,
                        context: context,
                        position: startIndex
                    });
                });
            }
        });

        return issues;
    }

    static generateRecommendations(issues) {
        const recommendations = [];
        if (issues.length === 0) {
            recommendations.push('This privacy policy appears to have reasonable terms for user privacy.');
        } else {
            recommendations.push('Consider the following concerns before using this service:');
            const highSeverityIssues = issues.filter(issue => issue.severity === 'high');
            if (highSeverityIssues.length > 0) {
                recommendations.push(`• ${highSeverityIssues.length} high-priority privacy concerns identified`);
            }
            const categories = [...new Set(issues.map(issue => issue.category))];
            recommendations.push(`• Issues found in: ${categories.join(', ')}`);
            recommendations.push('• Review each highlighted section carefully');
            recommendations.push('• Consider contacting the service provider for clarification');
        }
        return recommendations;
    }
}
