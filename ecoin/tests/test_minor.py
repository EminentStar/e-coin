from django.test import TestCase

from ecoin.miner import generate_an_operand
from ecoin.miner import generate_a_problem


class MinorTests(TestCase):
    def setUp(self):
        self.MAX_DIGIT = 10000
        pass
    
    def tearDown(self):
        pass

    def test_generate_an_operand(self):
        result = generate_an_operand()
        self.assertIs(int(result / 10000) <= 9, True)

    def test_generate_a_problem(self):
        result = generate_a_problem()

        expected_operand_01 = result.get('operands')[0]
        expected_operand_02 = result.get('operands')[1]

        expected_answer = expected_operand_01 * expected_operand_02
        self.assertEqual(expected_answer, result.get('answer'))
