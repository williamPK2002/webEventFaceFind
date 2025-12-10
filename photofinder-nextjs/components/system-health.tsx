import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Calendar, Image, Scan, CalendarCheck, ExternalLink } from "lucide-react"
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'

interface MetricValue {
    value: number
    labels: Record<string, string>
}

interface Metric {
    name: string
    help: string
    type: string
    values: MetricValue[]
}

interface DatabaseStats {
    totalUsers: number
    totalEvents: number
    totalPhotos: number
    facesDetected: number
    activeEvents: number
    eventsByStatus: Array<{ status: string; count: number }>
    photosByStatus: Array<{ status: string; count: number }>
    usersByRole: Array<{ role: string; count: number }>
}

export function SystemHealth() {
    const [metrics, setMetrics] = useState<Metric[]>([])
    const [stats, setStats] = useState<DatabaseStats>({
        totalUsers: 0,
        totalEvents: 0,
        totalPhotos: 0,
        facesDetected: 0,
        activeEvents: 0,
        eventsByStatus: [],
        photosByStatus: [],
        usersByRole: []
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Prometheus metrics for AI confidence
                const metricsResponse = await fetch("http://localhost:3000/metrics/json")
                if (metricsResponse.ok) {
                    const metricsData = await metricsResponse.json()
                    setMetrics(metricsData)
                }

                // Fetch database stats
                const statsResponse = await fetch("http://localhost:3000/admin/stats")
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json()
                    setStats(statsData)
                }
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 5000) // Refresh every 5s
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return <div className="p-12 text-center text-gray-400 animate-pulse">Loading analytics...</div>
    }

    // Calculate average AI confidence as a percentage
    const aiConfidenceMetric = metrics.find(m => m.name === "ai_confidence_score")
    let avgConfidencePercent = 0
    if (aiConfidenceMetric && aiConfidenceMetric.values.length > 0) {
        // Calculate average from all confidence score values
        const sum = aiConfidenceMetric.values.reduce((acc, v) => acc + v.value, 0)
        const avg = sum / aiConfidenceMetric.values.length
        avgConfidencePercent = Math.round(avg * 100) // Convert to percentage
    }
    // --- Chart Configurations ---

    // Confidence Gauge (Circular Progress)
    const confidenceGaugeOption = {
        series: [
            {
                type: 'gauge',
                startAngle: 90,
                endAngle: -270,
                pointer: { show: false },
                progress: {
                    show: true,
                    overlap: false,
                    roundCap: true,
                    clip: false,
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: '#fff'
                    }
                },
                axisLine: {
                    lineStyle: {
                        width: 30,
                        color: [[1, '#f1f5f9']]
                    }
                },
                splitLine: { show: false },
                axisTick: { show: false },
                axisLabel: { show: false },
                data: [
                    {
                        value: avgConfidencePercent,
                        name: 'Confidence',
                        title: {
                            offsetCenter: ['0%', '-20%'],
                            fontSize: 14,
                            color: '#64748b',
                            fontWeight: 500
                        },
                        detail: {
                            valueAnimation: true,
                            offsetCenter: ['0%', '10%'],
                            fontSize: 40,
                            fontWeight: 'bold',
                            color: '#0f172a',
                            formatter: '{value}%'
                        },
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                { offset: 0, color: '#10b981' },
                                { offset: 0.5, color: '#34d399' },
                                { offset: 1, color: '#6ee7b7' }
                            ])
                        }
                    }
                ]
            }
        ]
    };

    // Events by Status Pie Chart
    const eventsChartOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            bottom: '5%',
            left: 'center'
        },
        series: [{
            name: 'Events',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { show: false },
            emphasis: {
                scale: true,
                scaleSize: 5
            },
            data: stats.eventsByStatus.map(e => ({
                value: e.count,
                name: e.status,
                itemStyle: {
                    color: e.status === 'PUBLISHED' ? '#10b981' :
                        e.status === 'DRAFT' ? '#f59e0b' : '#6b7280'
                }
            }))
        }]
    };

    // Photos by Status Pie Chart
    const photosChartOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            bottom: '5%',
            left: 'center'
        },
        series: [{
            name: 'Photos',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { show: false },
            emphasis: {
                scale: true,
                scaleSize: 5
            },
            data: stats.photosByStatus.map(p => ({
                value: p.count,
                name: p.status,
                itemStyle: {
                    color: p.status === 'COMPLETED' ? '#10b981' :
                        p.status === 'PROCESSING' ? '#3b82f6' :
                            p.status === 'PENDING' ? '#f59e0b' : '#ef4444'
                }
            }))
        }]
    };

    // Users by Role Pie Chart
    const usersChartOption = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            bottom: '5%',
            left: 'center'
        },
        series: [{
            name: 'Users',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: { show: false },
            emphasis: {
                scale: true,
                scaleSize: 5
            },
            data: stats.usersByRole.map(u => ({
                value: u.count,
                name: u.role,
                itemStyle: {
                    color: u.role === 'STUDENT' ? '#3b82f6' :
                        u.role === 'PHOTOGRAPHER' ? '#8b5cf6' : '#ef4444'
                }
            }))
        }]
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">System Health</h2>
                    <p className="text-sm text-slate-500">Real-time metrics and performance monitoring</p>
                </div>
                <Button
                    onClick={() => window.open('http://localhost:3002', '_blank')}
                    variant="outline"
                    className="gap-2"
                >
                    <ExternalLink className="w-4 h-4" />
                    Open Grafana
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Total Events"
                    value={stats.totalEvents}
                    icon={Calendar}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                />
                <StatCard
                    title="Total Photos"
                    value={stats.totalPhotos}
                    icon={Image}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Faces Detected"
                    value={stats.facesDetected}
                    icon={Scan}
                    color="text-amber-600"
                    bgColor="bg-amber-50"
                />
                <StatCard
                    title="Active Events"
                    value={stats.activeEvents}
                    icon={CalendarCheck}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
            </div>

            {/* AI Confidence Gauge */}
            <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">AI Model Confidence</CardTitle>
                    <CardDescription>Average certainty across all predictions</CardDescription>
                </CardHeader>
                <CardContent>
                    <ReactECharts option={confidenceGaugeOption} style={{ height: '280px' }} />
                </CardContent>
            </Card>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Events by Status */}
                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Events by Status</CardTitle>
                        <CardDescription>Distribution of event statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={eventsChartOption} style={{ height: '280px' }} />
                    </CardContent>
                </Card>

                {/* Photos by Status */}
                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Photos by Status</CardTitle>
                        <CardDescription>Photo processing breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={photosChartOption} style={{ height: '280px' }} />
                    </CardContent>
                </Card>

                {/* Users by Role */}
                <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Users by Role</CardTitle>
                        <CardDescription>User role distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ReactECharts option={usersChartOption} style={{ height: '280px' }} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bgColor }: any) {
    return (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${bgColor} ${color}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
                    <div className="text-2xl font-bold text-slate-800">{value}</div>
                </div>
            </CardContent>
        </Card>
    )
}
