// Performance monitoring and analytics utilities

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTimes: Map<string, number> = new Map();

  startTimer(name: string): void {
    this.startTimes.set(name, performance.now());
  }

  endTimer(name: string, metadata?: Record<string, unknown>): number {
    const startTime = this.startTimes.get(name);
    if (!startTime) {
      console.warn(`Timer ${name} was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.startTimes.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`, metadata);
    }

    return duration;
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  clearMetrics(): void {
    this.metrics = [];
    this.startTimes.clear();
  }

  getAverageTime(metricName: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === metricName);
    if (relevantMetrics.length === 0) return 0;
    
    const total = relevantMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / relevantMetrics.length;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const startTimer = (name: string) => performanceMonitor.startTimer(name);
  const endTimer = (name: string, metadata?: Record<string, unknown>) => 
    performanceMonitor.endTimer(name, metadata);
  
  return { startTimer, endTimer };
}

// Form analytics
export interface FormAnalytics {
  formStartTime: number;
  fieldInteractions: Record<string, number>;
  validationErrors: Record<string, number>;
  completionTime?: number;
  abandonmentPoint?: string;
}

export class FormAnalyticsTracker {
  private analytics: FormAnalytics = {
    formStartTime: Date.now(),
    fieldInteractions: {},
    validationErrors: {},
  };

  trackFieldInteraction(fieldName: string): void {
    this.analytics.fieldInteractions[fieldName] = 
      (this.analytics.fieldInteractions[fieldName] || 0) + 1;
  }

  trackValidationError(fieldName: string): void {
    this.analytics.validationErrors[fieldName] = 
      (this.analytics.validationErrors[fieldName] || 0) + 1;
  }

  trackFormCompletion(): void {
    this.analytics.completionTime = Date.now() - this.analytics.formStartTime;
  }

  trackFormAbandonment(currentField: string): void {
    this.analytics.abandonmentPoint = currentField;
  }

  getAnalytics(): FormAnalytics {
    return { ...this.analytics };
  }

  reset(): void {
    this.analytics = {
      formStartTime: Date.now(),
      fieldInteractions: {},
      validationErrors: {},
    };
  }
}

// SDK Event Analytics
export interface SDKEventAnalytics {
  eventType: string;
  timestamp: number;
  provider: string;
  sessionId?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

export class SDKAnalyticsTracker {
  private events: SDKEventAnalytics[] = [];

  trackEvent(
    eventType: string,
    provider: string,
    sessionId?: string,
    metadata?: Record<string, unknown>
  ): void {
    this.events.push({
      eventType,
      provider,
      sessionId,
      timestamp: Date.now(),
      metadata,
    });
  }

  trackError(
    eventType: string,
    provider: string,
    error: string,
    sessionId?: string
  ): void {
    this.events.push({
      eventType,
      provider,
      sessionId,
      timestamp: Date.now(),
      error,
    });
  }

  getEvents(): SDKEventAnalytics[] {
    return [...this.events];
  }

  getEventsByProvider(provider: string): SDKEventAnalytics[] {
    return this.events.filter(event => event.provider === provider);
  }

  clearEvents(): void {
    this.events = [];
  }
}
