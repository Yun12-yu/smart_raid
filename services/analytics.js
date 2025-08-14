const { Driver, Booking, Mission, sequelize } = require('../models');
const { Op } = require('sequelize');

class AnalyticsService {
  // Get booking statistics for a given time period
  static async getBookingStats(startDate, endDate) {
    try {
      const bookings = await Booking.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [Driver]
      });

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
      const totalRevenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.fare), 0);

      return {
        totalBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0
      };
    } catch (error) {
      console.error('Error getting booking stats:', error);
      throw error;
    }
  }

  // Get daily booking trends for charts
  static async getDailyBookingTrends(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const bookings = await Booking.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('fare')), 'revenue']
        ],
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      });

      // Fill in missing dates with zero values
      const result = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const existingData = bookings.find(b => b.dataValues.date === dateStr);
        
        result.push({
          date: dateStr,
          count: existingData ? parseInt(existingData.dataValues.count) : 0,
          revenue: existingData ? parseFloat(existingData.dataValues.revenue) || 0 : 0
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return result;
    } catch (error) {
      console.error('Error getting daily trends:', error);
      throw error;
    }
  }

  // Get driver performance metrics
  static async getDriverPerformance() {
    try {
      const drivers = await Driver.findAll({
        include: [{
          model: Booking,
          required: false,
          where: {
            created_at: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }]
      });

      const performance = drivers.map(driver => {
        const bookings = driver.Bookings || [];
        const completedBookings = bookings.filter(b => b.status === 'completed');
        const totalRevenue = completedBookings.reduce((sum, b) => sum + parseFloat(b.fare), 0);
        
        return {
          id: driver.id,
          name: driver.name,
          status: driver.status,
          totalBookings: bookings.length,
          completedBookings: completedBookings.length,
          revenue: Math.round(totalRevenue * 100) / 100,
          completionRate: bookings.length > 0 ? Math.round((completedBookings.length / bookings.length) * 100) : 0
        };
      });

      return performance.sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Error getting driver performance:', error);
      throw error;
    }
  }

  // Get booking status distribution
  static async getBookingStatusDistribution(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const statusCounts = await Booking.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      return statusCounts.map(item => ({
        status: item.status,
        count: parseInt(item.dataValues.count)
      }));
    } catch (error) {
      console.error('Error getting status distribution:', error);
      throw error;
    }
  }

  // Get peak hours analysis
  static async getPeakHours(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const hourlyData = await Booking.findAll({
        where: {
          created_at: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: [
          [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM created_at')), 'hour'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM created_at'))],
        order: [[sequelize.fn('EXTRACT', sequelize.literal('HOUR FROM created_at')), 'ASC']]
      });

      // Fill in missing hours with zero values
      const result = [];
      for (let hour = 0; hour < 24; hour++) {
        const existingData = hourlyData.find(h => parseInt(h.dataValues.hour) === hour);
        result.push({
          hour,
          count: existingData ? parseInt(existingData.dataValues.count) : 0
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting peak hours:', error);
      throw error;
    }
  }

  // Get comprehensive dashboard data
  static async getDashboardData() {
    try {
      const [bookingStats, dailyTrends, driverPerformance, statusDistribution, peakHours] = await Promise.all([
        this.getBookingStats(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date()),
        this.getDailyBookingTrends(30),
        this.getDriverPerformance(),
        this.getBookingStatusDistribution(30),
        this.getPeakHours(30)
      ]);

      return {
        bookingStats,
        dailyTrends,
        driverPerformance,
        statusDistribution,
        peakHours
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;